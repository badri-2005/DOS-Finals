import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const JARVISLABS_LLM_URL = process.env.JARVISLABS_LLM_URL
  ?? process.env.NEXT_SERVER_JARVISLABS_LLM_URL
  ?? "https://e446de4381011.notebooksn.jarvislabs.net/api/generate";
const JARVISLABS_MODEL = process.env.JARVISLABS_MODEL ?? "healthcompanion:latest";

type UrgencyLevel = "low" | "medium" | "high";

type BackendTimelineEvent = {
  week?: string;
  event?: string;
  fatigue?: number;
  jointPain?: number;
  brainFog?: number;
  dizziness?: number;
  [key: string]: unknown;
};

type BackendMismatch = {
  week?: string;
  name?: string;
  date?: string;
  severity?: string;
  discrepancy?: string;
  advice?: string;
  coverage?: number;
  [key: string]: unknown;
};

type StoryAnalysis = {
  detectedSymptoms: string[];
  timeline: string;
  emotionalThemes: string[];
  painPoints: string[];
  lifestylePatterns: string[];
  suggestedDepartments: { dept: string; reason: string; confidence: number }[];
  patternSummary: string;
  urgencyLevel: UrgencyLevel;
  recommendedActions: string[];
  confidenceScore: number;
  sourceTimeline: BackendTimelineEvent[];
  clinicalGaps: BackendMismatch[];
};

const symptomPatterns: { label: string; patterns: RegExp[] }[] = [
  { label: "Fatigue", patterns: [/\bfatigue\b/i, /\btired(ness)?\b/i, /\bexhaust(ed|ion)\b/i, /\blow energy\b/i] },
  { label: "Joint pain", patterns: [/\bjoint pain\b/i, /\bjoint stiffness\b/i, /\bstiffness\b/i] },
  { label: "Brain fog", patterns: [/\bbrain fog\b/i, /\bfoggy\b/i, /\bmemory\b/i, /\bfocus\b/i, /\bconcentration\b/i] },
  { label: "Dizziness", patterns: [/\bdizz(y|iness)\b/i, /\blightheaded\b/i, /\bvertigo\b/i] },
  { label: "Sleep disruption", patterns: [/\bsleep\b/i, /\binsomnia\b/i, /\bwake up\b/i] },
  { label: "Headache", patterns: [/\bheadache\b/i, /\bmigraine\b/i] },
  { label: "Anxiety or stress", patterns: [/\banxiety\b/i, /\banxious\b/i, /\bstress\b/i, /\bpanic\b/i] },
  { label: "Digestive discomfort", patterns: [/\bdigestion\b/i, /\bstomach\b/i, /\bbloating\b/i, /\bnausea\b/i] },
];

function unique(values: string[]): string[] {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function clampConfidence(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(95, Math.max(35, Math.round(parsed)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return unique(value.filter((item): item is string => typeof item === "string"));
}

function countMatches(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
}

function textSpecificityScore(values: string[], story: string): number {
  const storyTokens = new Set(
    story
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(token => token.length > 4)
  );

  const usefulWords = values
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 4);

  if (usefulWords.length === 0) return 0;
  const overlap = usefulWords.filter(token => storyTokens.has(token)).length;
  return Math.min(12, Math.round((overlap / usefulWords.length) * 18));
}

function calculateEvidenceConfidence(input: {
  story: string;
  detectedSymptoms: string[];
  painPoints: string[];
  recommendedActions: string[];
  sourceTimeline: BackendTimelineEvent[];
  clinicalGaps: BackendMismatch[];
  suggestedDepartments: { dept: string; reason: string; confidence: number }[];
  aiGenerated: boolean;
}): number {
  const story = input.story.toLowerCase();
  const wordCount = input.story.trim().split(/\s+/).filter(Boolean).length;
  let score = input.aiGenerated ? 48 : 38;

  score += Math.min(10, Math.floor(wordCount / 35) * 2);
  score += Math.min(10, input.detectedSymptoms.length * 2);
  score += Math.min(8, input.sourceTimeline.length * 2);
  score += Math.min(8, input.clinicalGaps.length * 3);
  score += Math.min(6, input.recommendedActions.length * 2);
  score += Math.min(6, input.suggestedDepartments.length * 2);

  score += countMatches(story, [
    /\bfor\s+(the\s+past|more than|over)?\s*\w+\s+(day|week|month|year)s?\b/i,
    /\bstarted|began|since\b/i,
  ]) * 3;
  score += countMatches(story, [/\bdoctor|specialist|clinic|hospital|gp|physician\b/i]) * 3;
  score += countMatches(story, [/\btest|blood|x-?ray|scan|report|thyroid|diabetes|vitamin\b/i]) * 3;
  score += countMatches(story, [/\bmedication|medicine|tablet|prescribed|advised|treatment\b/i]) * 3;
  score += countMatches(story, [/\bwork|daily|routine|sleep|meal|food|activity|walking\b/i]) * 3;
  score += textSpecificityScore([...input.painPoints, ...input.recommendedActions], input.story);

  if (wordCount < 45) score -= 10;
  if (input.detectedSymptoms.length > 7) score -= 5;
  if (input.painPoints.some(point => /\bgeneric|not enough detail|track symptom timing\b/i.test(point))) score -= 6;
  if (input.clinicalGaps.length === 0) score -= 6;

  return Math.min(93, Math.max(42, score));
}

function cleanJsonText(value: string): string {
  const withoutFence = value.replace(/```json|```/gi, "").trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  return firstBrace >= 0 && lastBrace > firstBrace ? withoutFence.slice(firstBrace, lastBrace + 1) : withoutFence;
}

function formatSurveyContext(surveyData?: Record<string, unknown>): string {
  if (!surveyData) return "No survey context provided.";
  return Object.entries(surveyData)
    .filter(([, value]) => Array.isArray(value) ? value.length > 0 : Boolean(value))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join("\n") || "No survey context provided.";
}

function makeStoryPrompt(story: string, surveyData?: Record<string, unknown>): string {
  return `Analyze this patient story using only the facts the patient provided. Do not reuse canned examples. Do not mention model/provider names. Do not diagnose. Produce specific, assisted, patient-facing output.

Survey context:
${formatSurveyContext(surveyData)}

Patient story:
${story}

Return ONLY valid JSON with this exact shape:
{
  "detectedSymptoms": ["specific symptoms explicitly stated or strongly implied by this story only"],
  "timeline": "one concise patient-specific progression summary using events from this story",
  "emotionalThemes": ["specific emotional or care-experience themes from this story only"],
  "painPoints": [
    "specific user pain point + why it matters clinically or for daily life",
    "another specific user pain point + assisted interpretation"
  ],
  "lifestylePatterns": ["only lifestyle/triggers/impact mentioned or reasonably inferred from the story; if absent say what to track instead of inventing"],
  "suggestedDepartments": [
    { "dept": "department name", "reason": "story-specific reason, citing symptom/test/doctor context", "confidence": 0-100 }
  ],
  "patternSummary": "2-4 sentences. Explain the user's actual pattern and the practical solution path. Be specific to the story.",
  "urgencyLevel": "low|medium|high",
  "recommendedActions": [
    "patient-specific next step for doctor visit or tracking",
    "patient-specific question to ask based on tests/treatments mentioned"
  ],
  "sourceTimeline": [
    { "week": "story phase label", "event": "actual event from story", "fatigue": optional number, "jointPain": optional number, "brainFog": optional number, "dizziness": optional number }
  ],
  "clinicalGaps": [
    { "week": "story phase label", "name": "specific unresolved gap", "severity": "symptoms/impact from story", "discrepancy": "specific mismatch from story", "advice": "specific assisted follow-up", "coverage": 0-100 }
  ],
  "confidenceScore": 0-100
}

Rules:
- Avoid generic symptoms like anxiety, digestive discomfort, sleep disruption unless the story clearly says them.
- Pain points must not be copied from a previous patient or template.
- If the story mentions acidity, X-ray, blood tests, work concentration, family doctor, medication, or food advice, use those exact facts.
- If evidence is missing, recommend what to track or ask, instead of inventing facts.`;
}

function normalizeAiAnalysis(parsed: Record<string, unknown>, story: string): StoryAnalysis | null {
  const detectedSymptoms = asStringArray(parsed.detectedSymptoms);
  const painPoints = asStringArray(parsed.painPoints);
  const recommendedActions = asStringArray(parsed.recommendedActions);

  if (detectedSymptoms.length === 0 || painPoints.length === 0 || recommendedActions.length === 0) {
    return null;
  }

  const suggestedDepartments = Array.isArray(parsed.suggestedDepartments)
    ? parsed.suggestedDepartments
        .map(item => {
          if (!item || typeof item !== "object") return null;
          const dept = "dept" in item && typeof item.dept === "string" ? item.dept : "";
          const reason = "reason" in item && typeof item.reason === "string" ? item.reason : "";
          const confidence = "confidence" in item ? clampConfidence(item.confidence, 65) : 65;
          return dept && reason ? { dept, reason, confidence } : null;
        })
        .filter((item): item is { dept: string; reason: string; confidence: number } => Boolean(item))
    : [];

  const sourceTimeline = Array.isArray(parsed.sourceTimeline)
    ? parsed.sourceTimeline
        .flatMap(item => {
          if (!item || typeof item !== "object") return [];
          const week = "week" in item && typeof item.week === "string" ? item.week : undefined;
          const event = "event" in item && typeof item.event === "string" ? item.event : undefined;
          if (!event) return [];
          const normalized: BackendTimelineEvent = {
            week,
            event,
            fatigue: "fatigue" in item && typeof item.fatigue === "number" ? item.fatigue : undefined,
            jointPain: "jointPain" in item && typeof item.jointPain === "number" ? item.jointPain : undefined,
            brainFog: "brainFog" in item && typeof item.brainFog === "number" ? item.brainFog : undefined,
            dizziness: "dizziness" in item && typeof item.dizziness === "number" ? item.dizziness : undefined,
          };
          return [normalized];
        })
    : [];

  const clinicalGaps = Array.isArray(parsed.clinicalGaps)
    ? parsed.clinicalGaps
        .flatMap(item => {
          if (!item || typeof item !== "object") return [];
          const name = "name" in item && typeof item.name === "string" ? item.name : "";
          const discrepancy = "discrepancy" in item && typeof item.discrepancy === "string" ? item.discrepancy : "";
          const advice = "advice" in item && typeof item.advice === "string" ? item.advice : "";
          if (!name && !discrepancy && !advice) return [];
          const normalized: BackendMismatch = {
            week: "week" in item && typeof item.week === "string" ? item.week : undefined,
            name: name || "Unresolved story gap",
            severity: "severity" in item && typeof item.severity === "string" ? item.severity : undefined,
            discrepancy,
            advice,
            coverage: "coverage" in item ? clampConfidence(item.coverage, 50) : undefined,
          };
          return [normalized];
        })
    : [];

  const urgencyLevel = parsed.urgencyLevel === "high" || parsed.urgencyLevel === "medium" || parsed.urgencyLevel === "low"
    ? parsed.urgencyLevel
    : calculateUrgency(sourceTimeline, story);

  const normalized = {
    detectedSymptoms,
    timeline: typeof parsed.timeline === "string" && parsed.timeline.trim() ? parsed.timeline.trim() : summarizeTimeline(sourceTimeline, story),
    emotionalThemes: asStringArray(parsed.emotionalThemes),
    painPoints,
    lifestylePatterns: asStringArray(parsed.lifestylePatterns),
    suggestedDepartments: suggestedDepartments.length ? suggestedDepartments : suggestDepartments(detectedSymptoms, clinicalGaps, story),
    patternSummary: typeof parsed.patternSummary === "string" && parsed.patternSummary.trim()
      ? parsed.patternSummary.trim()
      : `This story needs review around ${detectedSymptoms.slice(0, 3).join(", ").toLowerCase()} and its daily impact.`,
    urgencyLevel,
    recommendedActions,
    confidenceScore: 0,
    sourceTimeline: sourceTimeline.length ? sourceTimeline : buildTimelineFromStory(story),
    clinicalGaps,
  };

  return {
    ...normalized,
    confidenceScore: calculateEvidenceConfidence({ ...normalized, story, aiGenerated: true }),
  };
}

async function callJarvisStoryAnalysis(story: string, surveyData?: Record<string, unknown>): Promise<StoryAnalysis | null> {
  if (!JARVISLABS_LLM_URL) return null;

  try {
    const response = await fetch(JARVISLABS_LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: JARVISLABS_MODEL,
        prompt: makeStoryPrompt(story, surveyData),
        system: "You are EchoCare's clinical story analysis assistant. You produce specific patient-story summaries, not diagnoses. Return only valid JSON.",
        stream: false,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const raw = typeof data.response === "string" ? data.response : JSON.stringify(data);
    const parsed = JSON.parse(cleanJsonText(raw)) as Record<string, unknown>;
    return normalizeAiAnalysis(parsed, story);
  } catch (error) {
    console.error("Jarvis story analysis failed:", error);
    return null;
  }
}

function sentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function splitSentences(story: string): string[] {
  return story
    .replace(/^#+\s*User Story\s*/i, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map(sentence => sentence.replace(/\s+/g, " ").trim())
    .filter(sentence => sentence.length > 0);
}

function firstMatchingSentence(sentences: string[], pattern: RegExp): string | undefined {
  return sentences.find(sentence => pattern.test(sentence));
}

function isBackendFallback(timeline: BackendTimelineEvent[], mismatches: BackendMismatch[]): boolean {
  const signature = [
    ...timeline.map(item => item.event ?? ""),
    ...mismatches.flatMap(item => [item.name ?? "", item.discrepancy ?? "", item.advice ?? ""]),
  ].join(" ");

  return /Primary CBC|Brain MRI \(Normal\)|Hashimoto|No Anemia|cellular iron reserve/i.test(signature);
}

function buildTimelineFromStory(story: string): BackendTimelineEvent[] {
  const sentences = splitSentences(story);
  const timeline: BackendTimelineEvent[] = [];
  const opening = firstMatchingSentence(sentences, /\b(for more than|for over|for the past|since|started|began|experiencing|suffering)\b/i);
  const primaryVisit = firstMatchingSentence(sentences, /\bfamily doctor|general physician|gp|primary doctor|blood test|blood tests|lab|report/i);
  const specialistVisit = firstMatchingSentence(sentences, /\borthopedic|orthopaedic|rheumatolog|neurolog|endocrinolog|specialist|x-?ray|scan|mri|ultrasound/i);
  const treatment = firstMatchingSentence(sentences, /\badvised|prescribed|medicine|medication|exercise|physio|therapy|painkiller|pain medication/i);
  const ongoing = firstMatchingSentence(sentences, /\bcontinued|still|remain|persist|worse|not improved|no improvement|daily|morning|bed\b/i);

  if (opening) {
    timeline.push({
      week: "Start",
      event: sentenceCase(opening),
      fatigue: /tired|fatigue|exhaust/i.test(opening) ? 7 : undefined,
      jointPain: /joint|pain|ache/i.test(opening) ? 7 : undefined,
      brainFog: /concentrat|brain fog|focus|memory/i.test(opening) ? 6 : undefined,
    });
  }

  if (primaryVisit) {
    timeline.push({
      week: "First doctor visit",
      event: sentenceCase(primaryVisit),
      fatigue: /tired|fatigue|exhaust/i.test(story) ? 7 : undefined,
      jointPain: /joint|pain|ache/i.test(story) ? 7 : undefined,
      brainFog: /concentrat|brain fog|focus|memory/i.test(story) ? 6 : undefined,
    });
  }

  if (specialistVisit && specialistVisit !== primaryVisit) {
    timeline.push({
      week: "Specialist visit",
      event: sentenceCase(specialistVisit),
      jointPain: /joint|pain|ache/i.test(story) ? 7 : undefined,
      brainFog: /concentrat|brain fog|focus|memory/i.test(story) ? 5 : undefined,
    });
  }

  if (treatment && !timeline.some(item => item.event === sentenceCase(treatment))) {
    timeline.push({
      week: "Advice given",
      event: sentenceCase(treatment),
      jointPain: /joint|pain|ache/i.test(story) ? 6 : undefined,
    });
  }

  if (ongoing && !timeline.some(item => item.event === sentenceCase(ongoing))) {
    timeline.push({
      week: "Current concern",
      event: sentenceCase(ongoing),
      fatigue: /tired|fatigue|exhaust|bed/i.test(story) ? 8 : undefined,
      jointPain: /joint|pain|ache/i.test(story) ? 7 : undefined,
      brainFog: /concentrat|brain fog|focus|memory/i.test(story) ? 6 : undefined,
    });
  }

  return timeline.length > 0 ? timeline : [{ week: "Patient report", event: "Story submitted for structured clinical review" }];
}

function buildClinicalGapsFromStory(story: string): BackendMismatch[] {
  const gaps: BackendMismatch[] = [];
  const hasNormalTests = /\bnormal|no major issue|came back normal|within range|clear\b/i.test(story);
  const hasBloodTests = /\bblood test|blood tests|lab|report|thyroid|diabetes|vitamin|inflammation|infection/i.test(story);
  const hasXray = /\bx-?ray|orthopedic|orthopaedic|bone|joint/i.test(story);
  const hasPersistentSymptoms = /\bcontinued|still|persist|remain|for more than|more than a year|daily|morning|exhausting\b/i.test(story);

  if (hasBloodTests && hasNormalTests && hasPersistentSymptoms) {
    gaps.push({
      week: "Lab review",
      name: "Normal broad blood reports did not resolve ongoing symptoms",
      severity: extractSymptoms(story, [], []).join(", "),
      discrepancy: "The story says blood tests for infections, thyroid problems, diabetes, vitamin deficiencies, and inflammation were normal, but joint pain, muscle aches, tiredness, and concentration difficulty continued.",
      advice: "Ask the doctor which exact markers were checked and whether follow-up testing is needed for persistent fatigue and joint pain, such as CBC details, ESR/CRP, ANA/RF/anti-CCP, ferritin, B12, vitamin D, HbA1c, and thyroid values including TSH with Free T4 when clinically appropriate.",
      coverage: 55,
    });
  }

  if (hasXray && hasNormalTests && /pain|joint|ache|muscle/i.test(story)) {
    gaps.push({
      week: "Orthopedic review",
      name: "X-ray findings do not fully explain pain pattern",
      severity: "Joint pain and muscle aches persisted",
      discrepancy: "The story says X-rays showed no major issue, but pain continued. A normal X-ray can miss inflammatory, soft-tissue, nerve, or systemic contributors to pain.",
      advice: "Discuss whether the pain pattern needs a rheumatology or physical medicine review, especially if there is morning stiffness, swelling, symmetric joint pain, weakness, or activity-limiting fatigue.",
      coverage: 50,
    });
  }

  if (/exercise more|pain medication|painkiller|medication when needed/i.test(story) && hasPersistentSymptoms) {
    gaps.push({
      week: "Treatment response",
      name: "Advice given was symptom-control focused",
      severity: "Pain continued after exercise and pain-medication advice",
      discrepancy: "The story describes advice to exercise more and take pain medication when needed, but it does not show a clear follow-up plan for why symptoms persisted.",
      advice: "Prepare a follow-up note with symptom duration, morning severity, functional limits, medication response, and triggers so the clinician can decide whether further evaluation or referral is needed.",
      coverage: 45,
    });
  }

  if (gaps.length === 0 && hasPersistentSymptoms) {
    gaps.push({
      week: "Current concern",
      name: "Persistent symptoms need structured follow-up",
      severity: extractSymptoms(story, [], []).join(", "),
      discrepancy: "The story describes ongoing symptoms, but there is not enough detail about what changed, what helped, and what was ruled out.",
      advice: "Track symptom timing, severity, triggers, relief measures, and prior report names before the next appointment.",
      coverage: 40,
    });
  }

  return gaps;
}

function extractSymptoms(story: string, timeline: BackendTimelineEvent[], mismatches: BackendMismatch[]): string[] {
  const source = [
    story,
    ...timeline.flatMap(item => [item.event, item.week]),
    ...mismatches.flatMap(item => [item.name, item.severity, item.discrepancy]),
  ].filter(Boolean).join(" ");

  const symptoms = symptomPatterns
    .filter(({ patterns }) => patterns.some(pattern => pattern.test(source)))
    .map(({ label }) => label);

  for (const item of timeline) {
    if (typeof item.fatigue === "number" && item.fatigue >= 5) symptoms.push("Fatigue");
    if (typeof item.jointPain === "number" && item.jointPain >= 4) symptoms.push("Joint pain");
    if (typeof item.brainFog === "number" && item.brainFog >= 4) symptoms.push("Brain fog");
    if (typeof item.dizziness === "number" && item.dizziness >= 4) symptoms.push("Dizziness");
  }

  return unique(symptoms).slice(0, 8);
}

function summarizeTimeline(timeline: BackendTimelineEvent[], story: string): string {
  if (timeline.length > 0) {
    const first = timeline[0];
    const last = timeline[timeline.length - 1];
    const events = timeline.filter(item => item.event).map(item => `${item.week ?? "Reported"}: ${item.event}`);
    const progression = `${first.week ?? "Initial report"} to ${last.week ?? "latest report"}`;
    return events.length > 0
      ? `${progression}. Key events: ${events.slice(0, 3).join("; ")}.`
      : `${progression}, with symptom scores tracked across ${timeline.length} reported points.`;
  }

  const match = story.match(/(?:last|past|for)\s+([\w\s-]{2,24})(?:\.|,|\s)/i);
  return match ? `Symptoms have been described over the ${match[1].trim()} period.` : "Timeline is based on the details provided in the story.";
}

function extractEmotionalThemes(story: string, mismatches: BackendMismatch[]): string[] {
  const text = `${story} ${mismatches.map(item => item.discrepancy).join(" ")}`;
  const themes: string[] = [];
  if (/\bdismiss(ed|ive|ing)?\b|\bnot listen|\bignored\b/i.test(text)) themes.push("Feeling dismissed or unheard");
  if (/\bfrustrat(ed|ion)?\b|\bstuck\b|\bno answer\b/i.test(text)) themes.push("Frustration with unresolved symptoms");
  if (/\banxious|anxiety|worried|fear\b/i.test(text)) themes.push("Health anxiety or worry");
  if (/\bhope|help|solution|answer\b/i.test(text)) themes.push("Seeking clarity and a practical plan");
  return themes.length ? themes : ["Seeking clearer clinical direction"];
}

function extractPainPoints(story: string, mismatches: BackendMismatch[]): string[] {
  const sentences = splitSentences(story);
  const points: string[] = [];
  const symptomSentence = firstMatchingSentence(sentences, /\bjoint pain|muscle ache|fatigue|tired|concentrat|brain fog|exhaust/i);
  const functionSentence = firstMatchingSentence(sentences, /\bdaily|morning|bed|work|routine|walking|stairs|exhausting/i);
  const testSentence = firstMatchingSentence(sentences, /\bnormal|no major issue|blood test|x-?ray|report|doctor|specialist/i);
  const treatmentSentence = firstMatchingSentence(sentences, /\badvised|medication|exercise|painkiller|treatment|continued/i);

  if (symptomSentence) points.push(sentenceCase(symptomSentence));
  if (functionSentence && functionSentence !== symptomSentence) points.push(sentenceCase(functionSentence));
  if (testSentence) points.push(sentenceCase(testSentence));
  if (treatmentSentence && treatmentSentence !== testSentence) points.push(sentenceCase(treatmentSentence));

  points.push(
    ...mismatches
      .map(item => item.discrepancy)
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map(value => sentenceCase(value.replace(/\s+/g, " ").trim()))
  );

  if (/\bnormal\b/i.test(story) && /\btest|blood|scan|mri|cbc|thyroid\b/i.test(story)) {
    points.push("Symptoms persisted even after earlier reports were described as normal.");
  }
  if (/\bdaily|work|study|routine|walk|activity\b/i.test(story)) {
    points.push("Symptoms are affecting daily function and routine.");
  }

  return unique(points).slice(0, 5);
}

function extractLifestylePatterns(story: string): string[] {
  const patterns: string[] = [];
  if (/\bsleep|insomnia|wake|tired\b/i.test(story)) patterns.push("Sleep quality may be contributing to symptom flares");
  if (/\bstress|work|pressure|anxiety\b/i.test(story)) patterns.push("Stress load appears relevant to symptom burden");
  if (/\bsedentary|desk|inactive|exercise|walk\b/i.test(story)) patterns.push("Activity pattern may need pacing and tracking");
  if (/\bdiet|meal|food|hydration|water\b/i.test(story)) patterns.push("Diet or hydration pattern may be worth tracking");
  return patterns.length ? patterns : ["Lifestyle contributors were not clearly detailed in the story"];
}

function suggestDepartments(symptoms: string[], mismatches: BackendMismatch[], story: string) {
  const departments: { dept: string; reason: string; confidence: number }[] = [];
  const text = `${story} ${symptoms.join(" ")} ${mismatches.map(item => `${item.name ?? ""} ${item.discrepancy ?? ""}`).join(" ")}`;

  if (/joint|stiff|inflamm|autoimmune|ana|crp|esr/i.test(text)) {
    departments.push({ dept: "Rheumatology", reason: "The story centers on persistent joint pain/muscle aches with normal initial reports, so inflammatory or autoimmune causes may need review.", confidence: 86 });
  }
  if (/thyroid|tsh|free t3|free t4|hormone|fatigue/i.test(text)) {
    departments.push({ dept: "Endocrinology", reason: "Constant tiredness plus prior thyroid screening makes it worth confirming what thyroid and metabolic markers were actually checked.", confidence: 76 });
  }
  if (/brain fog|dizziness|headache|mri|neurolog/i.test(text)) {
    departments.push({ dept: "Neurology", reason: "Difficulty concentrating or cognitive symptoms may need review if they persist, worsen, or affect daily functioning.", confidence: 68 });
  }
  if (/ferritin|iron|b12|vitamin|deficien/i.test(text)) {
    departments.push({ dept: "Internal Medicine", reason: "Broad normal reports with persistent fatigue and body pain may need a coordinated review of exact lab values and missing markers.", confidence: 78 });
  }
  if (/orthopedic|orthopaedic|x-?ray|muscle ache|pain medication|exercise/i.test(text)) {
    departments.push({ dept: "Physical Medicine", reason: "The orthopedic visit and exercise/pain-medication advice suggest a functional pain and mobility plan may be useful alongside medical review.", confidence: 70 });
  }

  if (departments.length === 0) {
    departments.push({ dept: "General Medicine", reason: "A physician can correlate the story, symptom timeline, and prior investigations before specialist referral.", confidence: 68 });
  }

  return departments.slice(0, 3);
}

function calculateUrgency(timeline: BackendTimelineEvent[], story: string): UrgencyLevel {
  if (/\bchest pain|fainting|suicidal|severe breath|weakness on one side|stroke\b/i.test(story)) return "high";
  const maxScore = Math.max(0, ...timeline.flatMap(item => [item.fatigue, item.jointPain, item.brainFog, item.dizziness]).filter((value): value is number => typeof value === "number"));
  if (maxScore >= 8 || /\bworsen|progressive|getting worse|unable\b/i.test(story)) return "medium";
  return "low";
}

function normalizeStoryAnalysis(data: {
  story_text?: string;
  timeline?: BackendTimelineEvent[];
  mismatches?: BackendMismatch[];
}, fallbackStory: string) {
  const storyText = data.story_text || fallbackStory;
  const backendTimeline = Array.isArray(data.timeline) ? data.timeline : [];
  const backendMismatches = Array.isArray(data.mismatches) ? data.mismatches : [];
  const useStoryDerivedAnalysis = isBackendFallback(backendTimeline, backendMismatches);
  const timeline = useStoryDerivedAnalysis ? buildTimelineFromStory(storyText) : backendTimeline;
  const mismatches = useStoryDerivedAnalysis ? buildClinicalGapsFromStory(storyText) : backendMismatches;
  const symptoms = extractSymptoms(storyText, timeline, mismatches);
  const departments = suggestDepartments(symptoms, mismatches, storyText);
  const actions = unique([
    ...mismatches.map(item => item.advice).filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    `Bring a one-page summary listing: ${symptoms.slice(0, 4).join(", ") || "main symptoms"}, when they started, and which reports were normal.`,
    "Track morning severity, activity limits, sleep, medication response, and pain score daily for two weeks.",
    departments[0] ? `Discuss whether a ${departments[0].dept} referral is appropriate.` : "",
  ]).slice(0, 5);

  const normalized = {
    detectedSymptoms: symptoms.length ? symptoms : ["Symptoms described in story"],
    timeline: summarizeTimeline(timeline, storyText),
    emotionalThemes: extractEmotionalThemes(storyText, mismatches),
    painPoints: extractPainPoints(storyText, mismatches),
    lifestylePatterns: extractLifestylePatterns(storyText),
    suggestedDepartments: departments,
    patternSummary: mismatches.length > 0
      ? `This story describes ${symptoms.slice(0, 4).join(", ").toLowerCase()} with ${mismatches.length} follow-up gap${mismatches.length === 1 ? "" : "s"} in the earlier care path. The immediate goal is not to label a diagnosis, but to turn the story into a focused doctor discussion with exact reports, missing markers, symptom impact, and referral questions.`
      : `The analysis is based on the submitted story and ${timeline.length} timeline point${timeline.length === 1 ? "" : "s"}. Use it as a structured summary for clinical discussion, not as a diagnosis.`,
    urgencyLevel: calculateUrgency(timeline, storyText),
    recommendedActions: actions,
    confidenceScore: 0,
    sourceTimeline: timeline,
    clinicalGaps: mismatches,
  };

  return {
    ...normalized,
    confidenceScore: calculateEvidenceConfidence({ ...normalized, story: storyText, aiGenerated: false }),
  };
}

export async function POST(req: NextRequest) {
  try {
    const { story, surveyData } = await req.json();
    if (!story || story.trim().length < 20) {
      return NextResponse.json({ error: "Story too short" }, { status: 400 });
    }

    // Get the JWT from the Authorization header forwarded by the client
    const authHeader = req.headers.get("Authorization") ?? "";
    const aiAnalysis = await callJarvisStoryAnalysis(story, surveyData);

    let backendData: { story_text?: string; timeline?: BackendTimelineEvent[]; mismatches?: BackendMismatch[] } | null = null;
    try {
      // Keep the existing FastAPI/MongoDB flow for persistence, but do not let its fallback mock drive the UI.
      const res = await fetch(`${BACKEND_URL}/api/story/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ story_text: story }),
      });

      if (res.ok) {
        backendData = await res.json();
      } else if (!aiAnalysis) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json({ error: err.detail || "Analysis failed" }, { status: res.status });
      }
    } catch (error) {
      if (!aiAnalysis) throw error;
    }

    return NextResponse.json(aiAnalysis ?? normalizeStoryAnalysis(backendData ?? {}, story));
  } catch (error) {
    console.error("analyze-story error:", error);
    return NextResponse.json({ error: "Analysis connection failed" }, { status: 500 });
  }
}

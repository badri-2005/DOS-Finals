import { NextRequest, NextResponse } from "next/server";

const JARVISLABS_LLM_URL = process.env.JARVISLABS_LLM_URL
  ?? process.env.NEXT_SERVER_JARVISLABS_LLM_URL
  ?? "https://e446de4381011.notebooksn.jarvislabs.net/api/generate";
const JARVISLABS_MODEL = process.env.JARVISLABS_MODEL ?? "healthcompanion:latest";

type ChatMessage = { role: string; content: string };
type ChatContext = {
  surveyData?: Record<string, unknown>;
  storyAnalysis?: Record<string, unknown>;
  storyText?: string;
  trackerLog?: Record<string, unknown>;
  reports?: Array<Record<string, unknown>>;
  requestedMarkers?: string[];
};

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(item => String(item).trim()).filter(Boolean) : [];
}

function compact(values: unknown[], limit = 5): string[] {
  const seen = new Set<string>();
  return values
    .map(value => String(value ?? "").trim())
    .filter(Boolean)
    .filter(value => {
      const key = value.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some(word => lower.includes(word));
}

function reviewedInputs(context: ChatContext) {
  const inputs = [];
  if (context.storyText || Object.keys(context.storyAnalysis ?? {}).length > 0) inputs.push("story / AI story analysis");
  if (Object.keys(context.surveyData ?? {}).length > 0) inputs.push("survey / onboarding responses");
  if (Object.keys(context.trackerLog ?? {}).length > 0) inputs.push("latest lifestyle tracker log");
  if ((context.reports ?? []).length > 0) inputs.push("uploaded report summaries");
  if ((context.requestedMarkers ?? []).length > 0) inputs.push("missing-marker checklist");
  return inputs.length ? inputs : ["this chat message only"];
}

function extractDepartments(story: Record<string, unknown>) {
  return Array.isArray(story.suggestedDepartments)
    ? story.suggestedDepartments
      .map(item => typeof item === "object" && item ? String((item as { dept?: unknown }).dept ?? "") : "")
      .filter(Boolean)
    : [];
}

function isDistress(latest: string, context: ChatContext) {
  const survey = context.surveyData ?? {};
  const tracker = context.trackerLog ?? {};
  const story = context.storyAnalysis ?? {};
  return includesAny(
    `${latest} ${survey.stressLevel ?? ""} ${tracker.mood ?? ""} ${story.emotionalThemes ?? ""}`,
    [
      "suicide", "self-harm", "hurt myself", "end my life", "want to die", "kill myself",
      "can't go on", "hopeless", "abuse", "beaten", "scared of my", "overwhelmed",
      "work stress", "family stress", "not in good mood", "not feeling good", "low mood",
    ]
  );
}

function buildDistressReply(latest: string) {
  const crisis = includesAny(latest, ["suicide", "self-harm", "hurt myself", "end my life", "want to die", "kill myself", "can't go on"]);
  return `I am really sorry you are carrying this right now. I am Echo, your health companion, not a doctor or emergency service.

What I am hearing:
- You may be feeling emotionally strained, overwhelmed, unsafe, or not in a good mood.
- I will stay with supportive, non-judgmental guidance and avoid medical conclusions here.

Support steps:
- If you may be in immediate danger or thinking of harming yourself, please contact local emergency services now or reach out to a trusted person nearby.
- If this is workplace or family stress, you do not have to explain everything at once. A counselor or trained mental health professional can help you unpack it safely.
- You can use the platform option to connect with a counselor, consultancy support, or request a callback.
- For the next few minutes, try one small grounding step: sit somewhere safe, slow your breathing, drink water if available, and message or call one trusted person.

One gentle question:
- Are you safe right now, or do you need urgent help connecting to someone?

Disclaimer:
This is supportive guidance, not a medical diagnosis, prescription, or crisis intervention service. Please contact emergency services or a qualified mental health professional if there is any immediate risk.${crisis ? " If you are in India, you can also consider a local crisis helpline or emergency number available in your area." : ""}`;
}

function buildContextSummary(latest: string, context: ChatContext) {
  const survey = context.surveyData ?? {};
  const story = context.storyAnalysis ?? {};
  const tracker = context.trackerLog ?? {};
  const reports = Array.isArray(context.reports) ? context.reports : [];
  const symptoms = compact([
    ...asStrings(survey.symptoms),
    ...asStrings(story.detectedSymptoms),
    survey.mainConcern,
  ]);
  const painPoints = compact(asStrings(story.painPoints), 3);
  const lifestyle = compact([
    ...asStrings(story.lifestylePatterns),
    survey.sleepQuality,
    survey.stressLevel,
    survey.dailyRoutine,
    survey.occupation,
    tracker.mood,
  ], 5);
  const departments = extractDepartments(story);
  const reportNames = reports.map(report => String(report.name ?? report.reportType ?? "")).filter(Boolean).slice(0, 3);
  const requestedMarkers = asStrings(context.requestedMarkers);

  return {
    latest,
    reviewed: reviewedInputs(context),
    symptoms,
    painPoints,
    lifestyle,
    departments,
    reportNames,
    requestedMarkers,
    storySummary: String(story.patternSummary ?? ""),
  };
}

function buildFallbackReply(latest: string, context: ChatContext) {
  const data = buildContextSummary(latest, context);
  const symptomLine = data.symptoms.length
    ? data.symptoms.join(", ")
    : "I do not yet have specific symptoms beyond what you just typed";
  const insight = data.storySummary || data.painPoints[0] || "The available data is still limited, so I can only make broad, cautious observations.";
  const specialist = data.departments[0] || "General Medicine / Primary Care";
  const systems = compact([
    "Allopathy - useful for medical evaluation, report review, and deciding whether a specialist referral is needed",
    data.lifestyle.length ? "Ayurveda - may be worth discussing for lifestyle, sleep, stress, and chronic symptom support with a registered practitioner" : "",
    data.symptoms.some(symptom => /pain|joint|body|digest|skin/i.test(symptom)) ? "Siddha - may be worth exploring only with a registered Siddha practitioner if culturally and geographically appropriate" : "",
  ], 3);

  return `1. **WELCOME / ACKNOWLEDGEMENT**
I hear you. I am Echo, your AI health companion, not a doctor. I will stay within what you have shared and the platform data available, and I will suggest only safe next steps to discuss with qualified professionals.

2. **SYMPTOM SUMMARY**
- Key concerns available right now: ${symptomLine}.
- Additional context: ${data.painPoints[0] || "No detailed pain point was found in the saved story analysis."}

3. **RELEVANT DATA REVIEWED**
${data.reviewed.map(item => `- ${item}`).join("\n")}
${data.reportNames.length ? `- Report context: ${data.reportNames.join(", ")}` : "- Uploaded report context: none available in this chat response"}

4. **INSIGHTS**
- ${insight}
- I am not assuming a diagnosis. The safest pattern is to connect your symptoms, logs, survey answers, and report gaps before choosing any care path.
- ${data.requestedMarkers.length ? `Your missing-marker checklist may be useful to bring up: ${data.requestedMarkers.slice(0, 4).join(", ")}.` : "If tests or reports are incomplete, the report auditor can help prepare questions for a clinician."}

5. **LIFESTYLE RECOMMENDATIONS**
- Keep a simple daily log of sleep, mood, food timing, activity, and symptom intensity.
- Aim for regular sleep and wake timing, a calming wind-down routine, and reduced screens close to bedtime.
- Choose balanced meals, regular hydration, and gentle movement within your comfort level.
- For stress, try brief breathing, grounding, or a short walk if it feels safe and manageable.

6. **SUGGESTED MEDICAL SYSTEM(S)**
${systems.map(system => `- ${system}.`).join("\n")}

7. **RECOMMENDED CONSULTATION**
- Consider discussing this with ${specialist}.
- If you want, you can use EchoCare to connect with consultancy support or request a callback for help choosing the right practitioner category.

8. **CONFIDENCE LEVEL**
${data.reviewed.length >= 3 ? "Medium" : "Low"} confidence, based on the amount and specificity of available platform data.

9. **DISCLAIMER**
This is not a medical diagnosis, prescription, or treatment plan. Please consult a qualified, registered healthcare professional in the relevant system before making medical decisions.`;
}

function buildSystemPrompt() {
  return `You are Echo, an AI health companion for EchoCare. You are not a doctor.

PERSONA AND TONE:
- Warm, trustworthy, attentive, conversational, empathetic, and clear.
- Be transparent about the basis of every response.
- Ask follow-up questions naturally. Do not demand a large amount of information at once.

DATA RULES:
Base the response strictly on the provided chat message and account context: story, lifestyle logs, survey/onboarding responses, uploaded reports, report summaries, symptom trends, activity history, and general WHO-consistent wellness guidance.
Never invent facts, symptoms, reports, dates, medicines, diagnoses, or data.

LEGAL BOUNDARY FOR INDIA:
- Do not diagnose.
- Do not prescribe.
- Do not name drugs, herbal formulations, dosages, or treatment regimens.
- Do not recommend medication or specific treatment protocols in Allopathy, Ayurveda, Siddha, or any system.
- Only suggest medical systems and practitioner categories to discuss with qualified, registered professionals.

RESPONSE FORMAT:
Every substantive non-crisis response must use exactly these nine numbered sections:
1. WELCOME / ACKNOWLEDGEMENT
2. SYMPTOM SUMMARY
3. RELEVANT DATA REVIEWED
4. INSIGHTS
5. LIFESTYLE RECOMMENDATIONS
6. SUGGESTED MEDICAL SYSTEM(S)
7. RECOMMENDED CONSULTATION
8. CONFIDENCE LEVEL
9. DISCLAIMER

Lifestyle recommendations may include only general healthy lifestyle activities: home comfort measures, gentle exercise, sleep hygiene, diet guidance, hydration, and stress management.`;
}

function violatesMedicalBoundary(text: string) {
  return /(\b\d+\s?(mg|mcg|ml|tablet|capsule|drops)\b|\btake\s+\w+\s+(daily|twice|once|after|before)\b|\bprescribe\b|\bdiagnosis is\b|\byou have\b)/i.test(text);
}

async function callJarvis(prompt: string, system: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(JARVISLABS_LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: JARVISLABS_MODEL,
        prompt,
        system,
        stream: false,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.response === "string" ? data.response.trim() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context = {} } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const latest = String((messages as ChatMessage[])[messages.length - 1]?.content ?? "");
    const chatContext = context as ChatContext;
    if (isDistress(latest, chatContext)) {
      return NextResponse.json({ message: buildDistressReply(latest) });
    }

    const summary = buildContextSummary(latest, chatContext);
    const prompt = `Latest user message:
${latest}

Conversation history:
${(messages as ChatMessage[]).slice(-6).map(message => `${message.role}: ${message.content}`).join("\n")}

Available account context, use only this:
${JSON.stringify(summary, null, 2)}

Generate the response now.`;

    const modelReply = await callJarvis(prompt, buildSystemPrompt());
    if (modelReply && !violatesMedicalBoundary(modelReply)) {
      return NextResponse.json({ message: modelReply });
    }

    return NextResponse.json({ message: buildFallbackReply(latest, chatContext) });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ message: "I am having a slight connection issue, but I am still listening. How are you holding up?" });
  }
}

// Gemini AI integration for EchoCare
// Add your key to .env.local: GEMINI_API_KEY=your_key_here

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface StoryAnalysis {
  detectedSymptoms: string[];
  timeline: string;
  emotionalThemes: string[];
  painPoints: string[];
  lifestylePatterns: string[];
  suggestedDepartments: { dept: string; reason: string; confidence: number }[];
  patternSummary: string;
  urgencyLevel: "low" | "medium" | "high";
  recommendedActions: string[];
  confidenceScore: number;
}

export interface HealthInsight {
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  type: "warning" | "success" | "info";
  department?: string;
  surveyFactors?: string[];
  lifestyleFactors?: string[];
  storyFactors?: string[];
}

export interface IntegrativeSuggestion {
  system: "Allopathy" | "Ayurveda" | "Siddha" | "Homeopathy" | "Naturopathy";
  icon: string;
  color: string;
  confidence: number;
  evidenceLevel: "Established" | "Moderate" | "Limited" | "Emerging";
  description: string;
  typicalFocus: string[];
  benefits: string[];
  limitations: string[];
  precautions: string[];
  aiReasoning: {
    symptoms: string[];
    surveyFactors: string[];
    lifestyleFactors: string[];
  };
  communityInsights: {
    totalUsers: number;
    outcomes: { label: string; percent: number; positive: boolean }[];
  };
}

export interface DoctorRecommendation {
  name: string;
  qualification: string;
  experience: number;
  specialization: string;
  hospital: string;
  fee: number;
  rating: number;
  reviews: number;
  languages: string[];
  online: boolean;
  offline: boolean;
  system: string;
  avatar: string;
}

type LooseRecord = Record<string, unknown>;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(item => String(item).trim()).filter(Boolean)
    : [];
}

function textIncludesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.some(word => lower.includes(word));
}

function compactStrings(values: unknown[], limit = 6): string[] {
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

function buildPatientText(data: {
  symptoms: string[];
  surveyData?: LooseRecord;
  storyAnalysis?: Partial<StoryAnalysis>;
}) {
  return [
    data.symptoms.join(" "),
    data.storyAnalysis?.patternSummary,
    ...(data.storyAnalysis?.detectedSymptoms ?? []),
    ...(data.storyAnalysis?.painPoints ?? []),
    ...(data.storyAnalysis?.lifestylePatterns ?? []),
    ...Object.values(data.surveyData ?? {}).flatMap(value => Array.isArray(value) ? value : [value]),
  ].map(value => String(value ?? "")).join(" ");
}

function buildDynamicIntegrativeSuggestions(data: {
  symptoms: string[];
  surveyData: LooseRecord;
  storyAnalysis?: Partial<StoryAnalysis>;
}): IntegrativeSuggestion[] {
  const patientText = buildPatientText(data);
  const symptoms = compactStrings([
    ...data.symptoms,
    ...(data.storyAnalysis?.detectedSymptoms ?? []),
    data.surveyData.mainConcern,
  ], 5);
  const surveyFactors = compactStrings([
    data.surveyData.symptomFrequency,
    data.surveyData.sleepQuality,
    data.surveyData.stressLevel,
    data.surveyData.previousConsultations,
    data.surveyData.careGoal,
  ], 4);
  const lifestyleFactors = compactStrings([
    ...(data.storyAnalysis?.lifestylePatterns ?? []),
    data.surveyData.dailyRoutine,
    data.surveyData.occupation,
    data.surveyData.travelTime,
  ], 4);

  const hasMoodOrStress = textIncludesAny(patientText, ["stress", "anxiety", "low mood", "sad", "hopeless", "not good", "sleep", "burnout"]);
  const hasPain = textIncludesAny(patientText, ["pain", "joint", "stiff", "ache", "muscle", "swelling", "body"]);
  const hasFatigue = textIncludesAny(patientText, ["fatigue", "tired", "energy", "exhaust", "weak"]);
  const hasDigestive = textIncludesAny(patientText, ["digest", "acidity", "stomach", "gut", "bloating", "appetite"]);
  const hasReportsGap = textIncludesAny(patientText, ["normal", "report", "blood test", "x-ray", "scan", "doctor", "no major"]);

  const score = (base: number, boosts: Array<[boolean, number]>) =>
    Math.min(94, Math.max(35, base + boosts.reduce((sum, [condition, boost]) => sum + (condition ? boost : 0), 0)));

  const sharedPrecautions = [
    "Use this as a discussion guide, not a diagnosis or self-treatment plan.",
    "Consult a qualified practitioner before starting medicines, herbs, supplements, or major diet changes.",
  ];

  const suggestions: IntegrativeSuggestion[] = [
    {
      system: "Allopathy",
      icon: getSystemIcon("Allopathy"),
      color: getSystemColor("Allopathy"),
      confidence: score(68, [[hasReportsGap, 12], [hasFatigue, 6], [hasPain, 6]]),
      evidenceLevel: "Established",
      description: `Modern medical review is suggested as the anchor path because your data points to ${symptoms.slice(0, 3).join(", ") || "ongoing symptoms"}${hasReportsGap ? " with previous reports or consultations that may need a second look" : ""}. The goal is to discuss appropriate evaluation and referrals, not to assume a diagnosis.`,
      typicalFocus: ["Clinical review", "Specialist referral", "Lab/report interpretation", "Medication safety"],
      benefits: ["Best route for ruling out urgent or treatable medical causes", "Can review whether prior tests match current symptoms", "Supports referrals such as general medicine, rheumatology, endocrinology, neurology, or mental health care"],
      limitations: ["Short visits may miss lifestyle and emotional context unless prepared", "Basic screens can be normal even when symptoms persist"],
      precautions: [...sharedPrecautions, "Seek urgent medical care for chest pain, fainting, severe weakness, self-harm thoughts, or rapidly worsening symptoms."],
      aiReasoning: { symptoms, surveyFactors, lifestyleFactors },
      communityInsights: getMockCommunityInsights("Allopathy"),
    },
    {
      system: "Naturopathy",
      icon: getSystemIcon("Naturopathy"),
      color: getSystemColor("Naturopathy"),
      confidence: score(55, [[hasFatigue, 10], [hasMoodOrStress, 8], [hasDigestive, 5]]),
      evidenceLevel: "Moderate",
      description: "Naturopathy and lifestyle medicine may be useful to explore for structured sleep, nutrition, hydration, gentle movement, and stress routines alongside medical care. This is a supportive path for rebuilding daily stability when mood and energy are low.",
      typicalFocus: ["Sleep routine", "Nutrition", "Hydration", "Gentle movement", "Stress regulation"],
      benefits: ["Turns broad wellness goals into trackable routines", "Can support fatigue, sleep disruption, and stress load", "Usually compatible with medical review when changes are gradual"],
      limitations: ["Not a replacement for diagnosis, urgent care, or prescribed treatment", "Progress depends on consistency and may be slow"],
      precautions: [...sharedPrecautions, "Avoid restrictive diets or detox plans without clinician review."],
      aiReasoning: { symptoms, surveyFactors, lifestyleFactors },
      communityInsights: getMockCommunityInsights("Naturopathy"),
    },
    {
      system: "Ayurveda",
      icon: getSystemIcon("Ayurveda"),
      color: getSystemColor("Ayurveda"),
      confidence: score(50, [[hasPain, 12], [hasDigestive, 8], [hasMoodOrStress, 5], [hasFatigue, 5]]),
      evidenceLevel: "Moderate",
      description: "Ayurveda may be worth discussing for chronic discomfort, digestion, sleep rhythm, stress, and constitution-based lifestyle support. Treat herbal or medicine suggestions as practitioner-led only, especially if you use other medicines.",
      typicalFocus: ["Chronic discomfort", "Digestive rhythm", "Sleep", "Stress", "Constitution-guided routines"],
      benefits: ["Holistic review of food, sleep, stress, and body symptoms together", "May provide culturally familiar care options", "Can complement conventional care when coordinated safely"],
      limitations: ["Evidence varies by condition and intervention", "Herbal quality and practitioner skill matter greatly"],
      precautions: [...sharedPrecautions, "Check herb-drug interactions and heavy-metal testing for any preparation."],
      aiReasoning: { symptoms, surveyFactors, lifestyleFactors },
      communityInsights: getMockCommunityInsights("Ayurveda"),
    },
    {
      system: "Homeopathy",
      icon: getSystemIcon("Homeopathy"),
      color: getSystemColor("Homeopathy"),
      confidence: score(38, [[hasMoodOrStress, 10], [hasReportsGap, 4]]),
      evidenceLevel: "Emerging",
      description: "Homeopathy is sometimes explored for individualized supportive care, especially when the person wants a longer conversation about symptoms and emotional context. Evidence is limited, so it should not delay medical evaluation.",
      typicalFocus: ["Individualized symptom history", "Emotional wellbeing", "Chronic symptom support"],
      benefits: ["Consultations may spend time on personal symptom context", "Generally low interaction risk when remedies are non-pharmacologic dilutions"],
      limitations: ["Scientific evidence is limited and debated", "Should not replace proven treatment or urgent evaluation"],
      precautions: [...sharedPrecautions, "Do not stop prescribed medicines or postpone referrals."],
      aiReasoning: { symptoms, surveyFactors, lifestyleFactors },
      communityInsights: getMockCommunityInsights("Homeopathy"),
    },
    {
      system: "Siddha",
      icon: getSystemIcon("Siddha"),
      color: getSystemColor("Siddha"),
      confidence: score(36, [[hasPain, 6], [hasDigestive, 5]]),
      evidenceLevel: "Limited",
      description: "Siddha may be considered for traditional supportive care where qualified practitioners are accessible, especially for chronic body discomfort or digestive patterns. It needs careful safety checks because some preparations require monitoring.",
      typicalFocus: ["Traditional chronic care", "Musculoskeletal discomfort", "Digestive patterns"],
      benefits: ["May be culturally relevant in Tamil-speaking regions", "Can offer structured traditional lifestyle advice"],
      limitations: ["Limited clinical evidence for many uses", "Fewer verified practitioners outside specific regions"],
      precautions: [...sharedPrecautions, "Only use registered BSMS practitioners and avoid untested mineral or metal preparations."],
      aiReasoning: { symptoms, surveyFactors, lifestyleFactors },
      communityInsights: getMockCommunityInsights("Siddha"),
    },
  ];

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    return getMockResponse(prompt);
  }

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  });

  if (!response.ok) throw new Error("Gemini API error");
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function analyzePatientStory(story: string): Promise<StoryAnalysis> {
  const prompt = `You are an empathetic AI healthcare companion analyzing a patient's health story. 
Analyze the following patient narrative and respond ONLY with valid JSON (no markdown, no explanation).

Patient Story:
"${story}"

Respond with this exact JSON structure:
{
  "detectedSymptoms": ["list of symptoms mentioned or implied"],
  "timeline": "brief description of when symptoms started and progression",
  "emotionalThemes": ["emotional themes like anxiety, frustration, hopelessness"],
  "painPoints": ["specific pain points or challenges mentioned"],
  "lifestylePatterns": ["lifestyle patterns observed like sleep issues, diet problems"],
  "suggestedDepartments": [
    {"dept": "Department Name", "reason": "Why this dept is relevant", "confidence": 85}
  ],
  "patternSummary": "2-3 sentence summary of the health pattern detected",
  "urgencyLevel": "low|medium|high",
  "recommendedActions": ["3-4 actionable next steps"],
  "confidenceScore": 82
}`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockStoryAnalysis();
  }
}

export async function generateHealthInsights(data: {
  symptoms: string[];
  sleepAvg: number;
  stressAvg: number;
  waterAvg: number;
  moodAvg: string;
  surveyData?: Record<string, string>;
  storyAnalysis?: Partial<StoryAnalysis>;
}): Promise<HealthInsight[]> {
  const prompt = `You are an AI health analyst. Based on this health tracking data, generate insights.
Respond ONLY with a JSON array of insights (no markdown):

Data:
- Symptoms: ${data.symptoms.join(", ")}
- Average sleep: ${data.sleepAvg} hours/night
- Average stress: ${data.stressAvg}/10
- Average water intake: ${data.waterAvg} cups/day
- Mood trend: ${data.moodAvg}
${data.surveyData ? `- Survey factors: ${JSON.stringify(data.surveyData)}` : ""}
${data.storyAnalysis ? `- Story patterns: ${data.storyAnalysis.patternSummary ?? ""}` : ""}

Return JSON array:
[
  {
    "title": "Insight title",
    "description": "2-3 sentence explanation",
    "evidence": ["fact 1", "fact 2", "fact 3"],
    "confidence": 85,
    "type": "warning|success|info",
    "department": "Optional department suggestion",
    "surveyFactors": ["survey element that contributed"],
    "lifestyleFactors": ["lifestyle element that contributed"],
    "storyFactors": ["story element that contributed"]
  }
]
Generate 3-4 insights.`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return getMockInsights();
  }
}

export async function generateIntegrativeSuggestions(data: {
  symptoms: string[];
  surveyData: Record<string, unknown>;
  storyAnalysis?: Partial<StoryAnalysis>;
  preferences?: string[];
}): Promise<IntegrativeSuggestion[]> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    return buildDynamicIntegrativeSuggestions(data);
  }

  const prompt = `You are an AI healthcare guide with knowledge of integrative medicine systems.
Based on the patient's profile, suggest appropriate healthcare systems to explore.
Respond ONLY with a valid JSON array (no markdown).

Patient Profile:
- Symptoms: ${data.symptoms.join(", ")}
- Survey data: ${JSON.stringify(data.surveyData)}
${data.storyAnalysis ? `- Story patterns: ${data.storyAnalysis.patternSummary ?? ""}` : ""}

Knowledge base (use this to inform suggestions):
- Allopathy (Evidence: Established): Best for acute conditions, emergencies, infections, chronic disease management. Strong evidence base.
- Ayurveda (Evidence: Moderate): Beneficial for chronic conditions, digestive issues, stress, joint problems. Thousands of years of practice.
- Siddha (Evidence: Limited): Traditional Tamil medicine. Focus on chronic diseases, skin conditions, metabolic disorders.
- Homeopathy (Evidence: Emerging): Used for chronic conditions, allergies, emotional well-being. Highly individualized approach.
- Naturopathy (Evidence: Moderate): Lifestyle medicine, nutrition, detox, chronic disease prevention. Evidence-based lifestyle modifications.

IMPORTANT: Frame as informational guidance only. Include precautions. Do NOT make definitive treatment claims.

Return JSON array with ALL 5 systems, ranked by relevance:
[
  {
    "system": "Ayurveda",
    "confidence": 78,
    "evidenceLevel": "Moderate",
    "description": "2-3 sentence description",
    "typicalFocus": ["area1", "area2", "area3"],
    "benefits": ["benefit1", "benefit2", "benefit3"],
    "limitations": ["limitation1", "limitation2"],
    "precautions": ["precaution1", "precaution2"],
    "aiReasoning": {
      "symptoms": ["symptom that influenced this"],
      "surveyFactors": ["survey factor"],
      "lifestyleFactors": ["lifestyle factor"]
    }
  }
]`;

  try {
    const raw = await callGemini(prompt);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return enrichWithMockData(parsed).sort((a, b) => b.confidence - a.confidence);
  } catch {
    return buildDynamicIntegrativeSuggestions(data);
  }
}

// ─── Mock responses ───────────────────────────────────────────────────────────

function getMockResponse(prompt: string): string {
  if (prompt.includes("patient story") || prompt.includes("Patient Story")) {
    return JSON.stringify(getMockStoryAnalysis());
  }
  if (prompt.includes("integrative") || prompt.includes("Ayurveda")) {
    return JSON.stringify(getMockIntegrativeSuggestions());
  }
  return JSON.stringify(getMockInsights());
}

function getMockStoryAnalysis(): StoryAnalysis {
  return {
    detectedSymptoms: ["Chronic fatigue", "Joint pain", "Brain fog", "Sleep disruption", "Morning stiffness"],
    timeline: "Symptoms appear to have started gradually over 12+ months, with progressive worsening over time.",
    emotionalThemes: ["Frustration with medical system", "Anxiety", "Desire for validation", "Hopeful"],
    painPoints: ["Unable to get a clear diagnosis", "Daily activities affected", "Doctors dismissing symptoms"],
    lifestylePatterns: ["Poor sleep quality", "Sedentary due to pain", "Irregular meal timings", "High workplace stress"],
    suggestedDepartments: [
      { dept: "Rheumatology", reason: "Joint pain, fatigue, and morning stiffness pattern suggests inflammatory or autoimmune cause", confidence: 87 },
      { dept: "Endocrinology", reason: "Fatigue and energy issues may indicate hormonal or thyroid involvement", confidence: 72 },
      { dept: "Neurology", reason: "Brain fog and cognitive symptoms warrant neurological evaluation", confidence: 65 },
    ],
    patternSummary: "Your story describes a classic presentation of unexplained chronic symptoms that have persisted despite normal test results. The combination of fatigue, joint pain, and cognitive symptoms occurring together suggests a systemic condition that standard blood panels may not capture.",
    urgencyLevel: "medium",
    recommendedActions: [
      "Request an ANA panel and inflammatory markers (ESR, CRP) from your GP",
      "Keep a daily symptom diary tracking pain, energy, and sleep quality",
      "Ask for a referral to Rheumatology for comprehensive evaluation",
      "Track whether symptoms worsen after physical activity (post-exertional malaise)",
    ],
    confidenceScore: 82,
  };
}

function getMockInsights(): HealthInsight[] {
  return [
    {
      title: "Chronic Fatigue Pattern Detected",
      description: "Your fatigue scores are consistently elevated across the past 3 weeks, with a clear correlation to sleep quality. On nights below 6 hours, the next day's energy score drops by an average of 40%.",
      evidence: ["Fatigue reported 18/21 days", "Avg energy: 4.2/10 on poor sleep days vs 6.8 on good sleep days", "Weekday fatigue 35% higher than weekend"],
      confidence: 87,
      type: "warning",
      department: "Rheumatology",
      surveyFactors: ["Reported poor sleep quality in survey", "Sedentary lifestyle noted"],
      lifestyleFactors: ["Sleep averaging 5.8hrs/night", "Low physical activity"],
      storyFactors: ["Mentioned persistent fatigue in story", "Morning stiffness described"],
    },
    {
      title: "Sleep Quality Improving",
      description: "Your sleep duration has increased from an average of 5.2 hours in week 1 to 6.8 hours in week 3. This is a positive trend that may be contributing to your slightly improved mood scores.",
      evidence: ["Week 1 avg: 5.2 hrs", "Week 3 avg: 6.8 hrs", "+31% improvement", "Mood correlation: +0.8 points"],
      confidence: 91,
      type: "success",
      surveyFactors: ["Sleep hygiene questions answered"],
      lifestyleFactors: ["Consistent bedtime observed"],
      storyFactors: [],
    },
    {
      title: "Hydration Below Target",
      description: "You're averaging 5.8 cups of water per day, which is below the recommended 8 cups. Chronic mild dehydration can significantly worsen fatigue, headaches, and cognitive function.",
      evidence: ["Avg 5.8 cups/day vs 8 target", "Met target on only 6/21 days", "Headache days correlate with low water days"],
      confidence: 95,
      type: "info",
      surveyFactors: ["Diet assessment noted irregular hydration"],
      lifestyleFactors: ["Work schedule limits hydration opportunities"],
      storyFactors: ["Headaches mentioned in patient story"],
    },
  ];
}

function enrichWithMockData(suggestions: IntegrativeSuggestion[]): IntegrativeSuggestion[] {
  return suggestions.map(s => ({
    ...s,
    icon: getSystemIcon(s.system),
    color: getSystemColor(s.system),
    communityInsights: getMockCommunityInsights(s.system),
  }));
}

function getSystemIcon(system: string): string {
  const icons: Record<string, string> = {
    Allopathy: "🏥", Ayurveda: "🌿", Siddha: "⚗️", Homeopathy: "💊", Naturopathy: "🍃"
  };
  return icons[system] ?? "🏥";
}

function getSystemColor(system: string): string {
  const colors: Record<string, string> = {
    Allopathy: "#3B82F6", Ayurveda: "#22C55E", Siddha: "#F59E0B", Homeopathy: "#8B5CF6", Naturopathy: "#0F766E"
  };
  return colors[system] ?? "#0F766E";
}

function getMockCommunityInsights(system: string): IntegrativeSuggestion["communityInsights"] {
  const data: Record<string, IntegrativeSuggestion["communityInsights"]> = {
    Allopathy: { totalUsers: 142, outcomes: [{ label: "Received accurate diagnosis", percent: 78, positive: true }, { label: "Symptom improvement", percent: 65, positive: true }, { label: "Specialist referral recommended", percent: 42, positive: true }, { label: "No significant improvement", percent: 18, positive: false }] },
    Ayurveda: { totalUsers: 98, outcomes: [{ label: "Improved sleep quality", percent: 68, positive: true }, { label: "Better energy levels", percent: 54, positive: true }, { label: "Reduced joint discomfort", percent: 42, positive: true }, { label: "No significant improvement", percent: 22, positive: false }] },
    Siddha: { totalUsers: 45, outcomes: [{ label: "Improved digestion", percent: 62, positive: true }, { label: "Better skin condition", percent: 48, positive: true }, { label: "Reduced inflammation", percent: 35, positive: true }, { label: "No significant improvement", percent: 28, positive: false }] },
    Homeopathy: { totalUsers: 76, outcomes: [{ label: "Improved emotional wellbeing", percent: 58, positive: true }, { label: "Better sleep", percent: 44, positive: true }, { label: "Reduced anxiety", percent: 52, positive: true }, { label: "No significant improvement", percent: 30, positive: false }] },
    Naturopathy: { totalUsers: 112, outcomes: [{ label: "Improved energy levels", percent: 72, positive: true }, { label: "Better diet adherence", percent: 65, positive: true }, { label: "Weight management", percent: 48, positive: true }, { label: "No significant improvement", percent: 20, positive: false }] },
  };
  return data[system] ?? data.Allopathy;
}

function getMockIntegrativeSuggestions(): IntegrativeSuggestion[] {
  return [
    {
      system: "Allopathy",
      icon: "🏥",
      color: "#3B82F6",
      confidence: 92,
      evidenceLevel: "Established",
      description: "Conventional modern medicine is the most evidence-based approach for diagnosing and treating conditions. Given your undiagnosed symptoms, a systematic allopathic evaluation should be the first step to rule out underlying conditions.",
      typicalFocus: ["Diagnosis & investigations", "Acute conditions", "Chronic disease management", "Emergency care"],
      benefits: ["Strongest evidence base", "Advanced diagnostic tools", "Specialist referral network", "Insurance coverage"],
      limitations: ["May not address root causes", "Focus on symptom management", "Limited holistic approach"],
      precautions: ["Always consult a licensed physician", "Follow prescribed treatments", "Report side effects"],
      aiReasoning: { symptoms: ["Chronic fatigue", "Joint pain", "Brain fog"], surveyFactors: ["No diagnosis yet", "Previous tests normal"], lifestyleFactors: ["Symptoms affecting daily function"] },
      communityInsights: { totalUsers: 142, outcomes: [{ label: "Received accurate diagnosis", percent: 78, positive: true }, { label: "Symptom improvement", percent: 65, positive: true }, { label: "Specialist referral", percent: 42, positive: true }, { label: "No significant improvement", percent: 18, positive: false }] },
    },
    {
      system: "Ayurveda",
      icon: "🌿",
      color: "#22C55E",
      confidence: 78,
      evidenceLevel: "Moderate",
      description: "Ayurveda, the ancient Indian medical system, focuses on balancing body constitution (Prakriti) through diet, herbs, and lifestyle modifications. It may complement conventional treatment for chronic fatigue, joint issues, and stress-related conditions.",
      typicalFocus: ["Chronic conditions", "Digestive health", "Stress & burnout", "Joint & musculoskeletal issues", "Immunity"],
      benefits: ["Holistic approach to health", "Personalized treatment", "Focus on prevention", "Natural remedies with fewer side effects", "Addresses mind-body connection"],
      limitations: ["Limited clinical trial evidence", "Results may take longer", "Quality of practitioners varies", "Some herbs may interact with medications"],
      precautions: ["Inform your allopathic doctor", "Avoid self-medication", "Ensure practitioner is registered", "Check herb-drug interactions"],
      aiReasoning: { symptoms: ["Chronic fatigue", "Joint pain", "Sleep disruption"], surveyFactors: ["Poor sleep quality", "High stress levels"], lifestyleFactors: ["Sedentary lifestyle", "Irregular diet"] },
      communityInsights: { totalUsers: 98, outcomes: [{ label: "Improved sleep quality", percent: 68, positive: true }, { label: "Better energy levels", percent: 54, positive: true }, { label: "Reduced joint discomfort", percent: 42, positive: true }, { label: "No significant improvement", percent: 22, positive: false }] },
    },
    {
      system: "Naturopathy",
      icon: "🍃",
      color: "#0F766E",
      confidence: 74,
      evidenceLevel: "Moderate",
      description: "Naturopathy emphasizes the body's inherent ability to heal through evidence-based lifestyle modifications including nutrition therapy, hydrotherapy, and natural therapies. It addresses the root causes of chronic conditions through comprehensive lifestyle assessment.",
      typicalFocus: ["Nutrition therapy", "Lifestyle modification", "Detoxification", "Prevention", "Chronic fatigue", "Metabolic health"],
      benefits: ["Evidence-based lifestyle interventions", "Comprehensive nutrition guidance", "Focus on prevention", "Mind-body integration", "Sustainable health habits"],
      limitations: ["Not suitable for emergencies", "Insurance coverage limited", "Requires significant lifestyle commitment", "Evidence varies by modality"],
      precautions: ["Not a substitute for emergency care", "Ensure practitioner is BNYS qualified", "Inform all treating doctors", "Dietary changes should be gradual"],
      aiReasoning: { symptoms: ["Fatigue", "Brain fog"], surveyFactors: ["Poor diet quality", "Low water intake", "Sedentary lifestyle"], lifestyleFactors: ["Diet and hydration gaps noted"] },
      communityInsights: { totalUsers: 112, outcomes: [{ label: "Improved energy levels", percent: 72, positive: true }, { label: "Better diet adherence", percent: 65, positive: true }, { label: "Weight management", percent: 48, positive: true }, { label: "No significant improvement", percent: 20, positive: false }] },
    },
    {
      system: "Homeopathy",
      icon: "💊",
      color: "#8B5CF6",
      confidence: 58,
      evidenceLevel: "Emerging",
      description: "Homeopathy is a highly individualized system that uses extremely diluted natural substances. It focuses on treating the whole person, particularly for chronic conditions, emotional wellbeing, and conditions where conventional medicine hasn't provided answers.",
      typicalFocus: ["Chronic conditions", "Allergies", "Emotional wellbeing", "Immunity", "Individualized treatment"],
      benefits: ["Highly personalized approach", "No known drug interactions", "Addresses mental-emotional symptoms", "Gentle on the body"],
      limitations: ["Scientific evidence is limited", "Highly controversial in medical community", "Results are subjective", "May take extended time"],
      precautions: ["Do not discontinue conventional medications", "Inform treating physicians", "Ensure practitioner holds BHMS/MD(Hom)", "Not suitable for acute emergencies"],
      aiReasoning: { symptoms: ["Emotional themes in story", "Anxiety", "Frustration"], surveyFactors: ["Mental wellbeing concerns", "Anxiety reported"], lifestyleFactors: ["High stress pattern"] },
      communityInsights: { totalUsers: 76, outcomes: [{ label: "Improved emotional wellbeing", percent: 58, positive: true }, { label: "Better sleep", percent: 44, positive: true }, { label: "Reduced anxiety", percent: 52, positive: true }, { label: "No significant improvement", percent: 30, positive: false }] },
    },
    {
      system: "Siddha",
      icon: "⚗️",
      color: "#F59E0B",
      confidence: 48,
      evidenceLevel: "Limited",
      description: "Siddha is one of the world's oldest medical systems, originating in Tamil Nadu. It uses herbs, minerals, and metals in a highly purified form. It may be relevant for chronic metabolic conditions, skin disorders, and musculoskeletal complaints.",
      typicalFocus: ["Chronic metabolic conditions", "Skin disorders", "Musculoskeletal complaints", "Digestive disorders", "Rejuvenation"],
      benefits: ["Deep-rooted traditional knowledge", "Holistic approach", "May help with chronic conditions", "Strong mineral-based formulations"],
      limitations: ["Very limited scientific evidence", "Few qualified practitioners outside Tamil Nadu", "Some formulations need strict monitoring", "Long treatment duration"],
      precautions: ["Only consult registered BSMS practitioners", "Heavy metal preparations need strict monitoring", "Do not self-medicate", "Regular blood tests may be needed"],
      aiReasoning: { symptoms: ["Joint pain", "Chronic fatigue"], surveyFactors: ["Metabolic factors noted"], lifestyleFactors: ["Southern Indian dietary patterns relevant"] },
      communityInsights: { totalUsers: 45, outcomes: [{ label: "Improved digestion", percent: 62, positive: true }, { label: "Better skin condition", percent: 48, positive: true }, { label: "Reduced inflammation", percent: 35, positive: true }, { label: "No significant improvement", percent: 28, positive: false }] },
    },
  ];
}

export function getMockDoctors(system: string): DoctorRecommendation[] {
  const doctors: Record<string, DoctorRecommendation[]> = {
    Allopathy: [
      { name: "Dr. Priya Sharma", qualification: "MBBS, MD (Internal Medicine)", experience: 14, specialization: "Internal Medicine & Chronic Disease", hospital: "Apollo Hospitals, Chennai", fee: 800, rating: 4.8, reviews: 312, languages: ["English", "Hindi", "Tamil"], online: true, offline: true, system: "Allopathy", avatar: "P" },
      { name: "Dr. Arun Mehta", qualification: "MBBS, DNB (Rheumatology)", experience: 11, specialization: "Rheumatology", hospital: "Fortis Malar Hospital, Chennai", fee: 1200, rating: 4.9, reviews: 189, languages: ["English", "Hindi"], online: true, offline: true, system: "Allopathy", avatar: "A" },
      { name: "Dr. Kavitha Rajan", qualification: "MBBS, MD (Endocrinology)", experience: 9, specialization: "Endocrinology & Metabolism", hospital: "MIOT International, Chennai", fee: 1000, rating: 4.7, reviews: 241, languages: ["English", "Tamil"], online: false, offline: true, system: "Allopathy", avatar: "K" },
    ],
    Ayurveda: [
      { name: "Dr. Vaidya Ramesh Nair", qualification: "BAMS, MD (Ayurveda)", experience: 18, specialization: "Panchakarma & Chronic Disease", hospital: "Santhigiri Ayurveda, Trivandrum", fee: 400, rating: 4.9, reviews: 428, languages: ["English", "Malayalam", "Hindi"], online: true, offline: true, system: "Ayurveda", avatar: "V" },
      { name: "Dr. Lakshmi Devi", qualification: "BAMS, MD (Kayachikitsa)", experience: 12, specialization: "Rasayana & Rejuvenation Therapy", hospital: "Arya Vaidya Sala, Kottakkal", fee: 350, rating: 4.8, reviews: 356, languages: ["English", "Malayalam", "Tamil"], online: true, offline: true, system: "Ayurveda", avatar: "L" },
      { name: "Dr. Suresh Ayyangar", qualification: "BAMS, PhD (Dravyaguna)", experience: 15, specialization: "Herbal Medicine & Joint Care", hospital: "SDM Ayurveda Hospital, Udupi", fee: 300, rating: 4.6, reviews: 198, languages: ["English", "Kannada", "Hindi"], online: false, offline: true, system: "Ayurveda", avatar: "S" },
    ],
    Naturopathy: [
      { name: "Dr. Anita Desai", qualification: "BNYS, MSc (Nutrition)", experience: 10, specialization: "Clinical Nutrition & Lifestyle Medicine", hospital: "Nature Cure Hospital, Bengaluru", fee: 500, rating: 4.7, reviews: 167, languages: ["English", "Hindi", "Kannada"], online: true, offline: true, system: "Naturopathy", avatar: "A" },
      { name: "Dr. Prasad Hegde", qualification: "BNYS, PhD (Naturopathy)", experience: 16, specialization: "Hydrotherapy & Detox Programs", hospital: "JSS Naturopathy, Mysuru", fee: 450, rating: 4.8, reviews: 223, languages: ["English", "Kannada"], online: true, offline: true, system: "Naturopathy", avatar: "P" },
    ],
    Homeopathy: [
      { name: "Dr. Meena Krishnan", qualification: "BHMS, MD (Homeopathy)", experience: 13, specialization: "Constitutional Homeopathy", hospital: "Homeo Care Clinic, Coimbatore", fee: 300, rating: 4.6, reviews: 145, languages: ["English", "Tamil", "Hindi"], online: true, offline: true, system: "Homeopathy", avatar: "M" },
      { name: "Dr. Vijay Patil", qualification: "BHMS, MSc (Applied Homeopathy)", experience: 8, specialization: "Chronic Disease & Mental Health", hospital: "Dr. Patil's Homeopathy, Pune", fee: 400, rating: 4.7, reviews: 98, languages: ["English", "Marathi", "Hindi"], online: true, offline: false, system: "Homeopathy", avatar: "V" },
    ],
    Siddha: [
      { name: "Dr. Muthukumar Pillai", qualification: "BSMS, MD (Sirappu Maruthuvam)", experience: 20, specialization: "Varmam Therapy & Chronic Pain", hospital: "Govt. Siddha Medical College, Chennai", fee: 200, rating: 4.8, reviews: 312, languages: ["Tamil", "English"], online: false, offline: true, system: "Siddha", avatar: "M" },
      { name: "Dr. Selvi Ramasamy", qualification: "BSMS, PhD (Medicinal Plants)", experience: 11, specialization: "Herbal Medicine & Skin Disorders", hospital: "Siddha Healing Centre, Madurai", fee: 250, rating: 4.5, reviews: 87, languages: ["Tamil", "English"], online: true, offline: true, system: "Siddha", avatar: "S" },
    ],
  };
  return doctors[system] ?? doctors.Allopathy;
}

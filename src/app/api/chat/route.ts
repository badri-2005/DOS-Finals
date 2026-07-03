import { NextRequest, NextResponse } from "next/server";

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

function buildCompanionReply(latest: string, context: ChatContext) {
  const survey = context.surveyData ?? {};
  const story = context.storyAnalysis ?? {};
  const tracker = context.trackerLog ?? {};
  const reports = Array.isArray(context.reports) ? context.reports : [];
  const requestedMarkers = asStrings(context.requestedMarkers);
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
  const departments = Array.isArray(story.suggestedDepartments)
    ? story.suggestedDepartments.map(item => typeof item === "object" && item ? String((item as { dept?: unknown }).dept ?? "") : "").filter(Boolean)
    : [];
  const reportNames = reports.map(report => String(report.name ?? report.reportType ?? "")).filter(Boolean).slice(0, 3);
  const lowMood = includesAny(`${latest} ${survey.stressLevel ?? ""} ${tracker.mood ?? ""} ${story.emotionalThemes ?? ""}`, ["sad", "low", "not good", "anxious", "stress", "hopeless", "tired", "exhausted", "overwhelmed"]);
  const careMethods = compact([
    departments[0] ? `Discuss a ${departments[0]} review with a qualified clinician` : "Start with a general physician review if symptoms are continuing",
    symptoms.some(s => /pain|joint|stiff|ache/i.test(s)) ? "Ask whether physiotherapy, rheumatology, or pain-management review is appropriate" : "",
    symptoms.some(s => /fatigue|energy|sleep|brain/i.test(s)) ? "Consider a sleep, nutrition, hydration, and gentle-activity plan with a clinician or lifestyle-medicine professional" : "",
    lowMood ? "Consider speaking with a mental health professional or counselor for emotional support while the medical workup continues" : "",
    requestedMarkers.length ? `Bring your missing-marker checklist: ${requestedMarkers.slice(0, 3).join(", ")}` : "",
  ], 5);

  return `Symptom Analysis:
1. ${symptoms[0] || "Your current concern"}${symptoms[1] ? ` with ${symptoms[1]}` : ""}.
2. ${painPoints[0] || "The main pattern is still being clarified from your survey, story, tracker, and reports."}

### Lifestyle and Mood Context:
- Mood/Stress: ${lowMood ? "You sound low or overloaded right now, so the next step should feel gentle and supportive rather than forceful." : "No strong distress signal was detected in this message, but emotional context still matters."}
- Routine: ${lifestyle[0] || "Keep logging sleep, stress, food, water, activity, and symptom changes so patterns become clearer."}
- Reports: ${reportNames.length ? `I can see report context such as ${reportNames.join(", ")}.` : "No uploaded report summary is available in this chat context yet."}

### Insights:
1. **User-data based:** I am using your saved survey, story analysis, tracker notes, report summaries, and this message rather than a static template.
2. **Care direction:** ${departments[0] ? `${departments[0]} appears relevant as a discussion/referral option based on your existing analysis.` : "A primary-care review can help decide which specialist is appropriate."}
3. **Supportive framing:** These are possible routes to discuss, not a diagnosis or exact treatment plan.

### Suggested Care Methods to Discuss:
${careMethods.map((method, index) => `${index + 1}. ${method}.`).join("\n")}

### What You Can Say to a Doctor:
- "These symptoms are affecting my daily life, and I would like help reviewing patterns across my story, tracker, and reports."
- "Can we discuss which tests, referrals, or supportive therapies are appropriate instead of assuming one cause?"

### Confidence Level:
Moderate. The suggestion is grounded in your saved data, but a qualified clinician should decide the actual diagnosis, treatment, and booking priority.`;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, context = {} } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const latest = String((messages as ChatMessage[])[messages.length - 1]?.content ?? "");
    return NextResponse.json({ message: buildCompanionReply(latest, context as ChatContext) });
  } catch (error) {
    console.error("Chat API proxy error:", error);
    return NextResponse.json({ message: "I'm having a slight connection issue, but I am still listening. How are you holding up?" });
  }
}

import { NextRequest, NextResponse } from "next/server";

const JARVISLABS_LLM_URL = process.env.JARVISLABS_LLM_URL
  ?? process.env.NEXT_SERVER_JARVISLABS_LLM_URL
  ?? "https://e446de4381011.notebooksn.jarvislabs.net/api/generate";
const JARVISLABS_MODEL = process.env.JARVISLABS_MODEL ?? "healthcompanion:latest";

function cleanTranslatedText(value: string): string {
  return value
    .replace(/```(?:text|json)?/gi, "")
    .replace(/```/g, "")
    .replace(/^english\s*translation\s*:\s*/i, "")
    .replace(/^translation\s*:\s*/i, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const sourceLanguage = typeof body.sourceLanguage === "string" ? body.sourceLanguage : "ta-IN";

    if (!text) {
      return NextResponse.json({ error: "No transcript provided." }, { status: 400 });
    }

    if (sourceLanguage !== "ta-IN") {
      return NextResponse.json({ originalText: text, translatedText: text, sourceLanguage });
    }

    const response = await fetch(JARVISLABS_LLM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: JARVISLABS_MODEL,
        prompt: `Translate this Tamil patient speech transcript into clear English for a clinical story form.

Rules:
- Preserve symptoms, duration, body parts, severity, medicines, doctors, tests, reports, food, work, sleep, travel, and daily-life impact.
- Do not diagnose.
- Do not add facts.
- Return only the English translation text.

Tamil transcript:
${text}`,
        system: "You are a medical translation assistant. Translate Tamil patient speech into faithful English clinical-story text. Return only the translated text.",
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Translation service failed." }, { status: 502 });
    }

    const data = await response.json();
    const raw = typeof data.response === "string" ? data.response : "";
    const translatedText = cleanTranslatedText(raw);

    return NextResponse.json({
      originalText: text,
      translatedText: translatedText || text,
      sourceLanguage,
    });
  } catch (error) {
    console.error("Voice translation failed:", error);
    return NextResponse.json({ error: "Voice translation failed." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateIntegrativeSuggestions } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms = [], surveyData = {}, storyAnalysis } = body;

    const suggestions = await generateIntegrativeSuggestions({
      symptoms: Array.isArray(symptoms) ? symptoms.map(String) : [],
      surveyData,
      storyAnalysis,
    });
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Integrative API error:", err);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}

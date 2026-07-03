import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { symptoms = [], surveyData = {}, storyAnalysis } = body;

    // Send to Python FastAPI backend
    const res = await fetchFromBackend("/api/integrative", {
      method: "POST",
      body: JSON.stringify({
        symptoms,
        surveyData,
        storyAnalysis
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || "Suggestions lookup failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Integrative API error:", err);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorName, system, rating, helpfulness, communication, followUp, satisfaction, review } = body;

    if (!doctorName || !system || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Forward to Python FastAPI backend (mapping keys to snake_case)
    const res = await fetchFromBackend("/api/doctor-feedback", {
      method: "POST",
      body: JSON.stringify({
        doctor_name: doctorName,
        system,
        rating,
        helpfulness,
        communication,
        follow_up: followUp,
        satisfaction,
        review
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || "Failed to submit feedback" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, feedbackId: data.id });
  } catch (err) {
    console.error("Feedback API error:", err);
    return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 });
  }
}

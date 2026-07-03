import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Map client-side tracker properties to FastAPI schemas
    const payload = {
      date: body.date ? body.date.split("T")[0] : new Date().toISOString().split("T")[0],
      fatigue: body.energy ? 10 - body.energy : 5, // Inverse energy to fatigue
      joint_pain: body.pain || 3,
      brain_fog: body.symptoms.includes("Brain Fog") ? 7 : 3,
      dizziness: body.symptoms.includes("Dizziness") ? 6 : 2,
      mood: body.mood || "Okay",
      sleep_hours: body.sleep || 7.0,
      water_intake: body.water || 2.0,
      notes: body.notes || `Symptoms logged: ${body.symptoms.join(", ")}`
    };

    const res = await fetchFromBackend("/api/tracker", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || "Failed to save daily check-in" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, log: data });
  } catch (error) {
    console.error("Tracker API save error:", error);
    return NextResponse.json({ error: "Daily tracker connection error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetchFromBackend("/api/tracker/history", {
      method: "GET"
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || "Failed to load log history" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Tracker API history fetch error:", error);
    return NextResponse.json({ error: "Daily tracker history connection error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

type TrackerLog = {
  fatigue?: number;
  joint_pain?: number;
  brain_fog?: number;
  dizziness?: number;
  mood?: string;
  sleep_hours?: number;
  water_intake?: number;
  notes?: string;
};

type Insight = {
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  type: "warning" | "success" | "info";
  department?: string;
  surveyFactors?: string[];
  lifestyleFactors?: string[];
  storyFactors?: string[];
};

function average(values: number[]): number {
  const valid = values.filter(value => Number.isFinite(value) && value > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function compact(values: unknown[]): string[] {
  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function confidence(base: number, evidenceCount: number): number {
  return Math.min(92, Math.max(52, base + evidenceCount * 5));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      surveyData = {},
      storyAnalysis = {},
      trackerHistory = [],
      storyText = "",
    } = body;

    const trackerLogs: TrackerLog[] = Array.isArray(trackerHistory) ? trackerHistory : [];
    const detectedSymptoms = Array.isArray(storyAnalysis.detectedSymptoms) ? storyAnalysis.detectedSymptoms.map(String) : [];
    const painPoints = Array.isArray(storyAnalysis.painPoints) ? storyAnalysis.painPoints.map(String) : [];
    const departments = Array.isArray(storyAnalysis.suggestedDepartments) ? storyAnalysis.suggestedDepartments : [];
    const fatigueAvg = round(average(trackerLogs.map(log => Number(log.fatigue) || 0)));
    const painAvg = round(average(trackerLogs.map(log => Number(log.joint_pain) || 0)));
    const brainFogAvg = round(average(trackerLogs.map(log => Number(log.brain_fog) || 0)));
    const sleepAvg = round(average(trackerLogs.map(log => Number(log.sleep_hours) || 0)));
    const waterAvg = round(average(trackerLogs.map(log => Number(log.water_intake) || 0)));

    const insights: Insight[] = [];
    const mainConcern = typeof surveyData.mainConcern === "string" ? surveyData.mainConcern : "";
    const symptomPattern = typeof surveyData.symptomFrequency === "string" ? surveyData.symptomFrequency : "";
    const travelTime = typeof surveyData.travelTime === "string" ? surveyData.travelTime : "";
    const occupation = typeof surveyData.occupation === "string" ? surveyData.occupation : "";
    const dailyRoutine = typeof surveyData.dailyRoutine === "string" ? surveyData.dailyRoutine : "";
    const careGoal = typeof surveyData.careGoal === "string" ? surveyData.careGoal : "";

    if (mainConcern || detectedSymptoms.length > 0 || painPoints.length > 0) {
      const evidence = compact([
        mainConcern ? `Main concern: ${mainConcern}` : "",
        symptomPattern ? `Pattern noted: ${symptomPattern}` : "",
        detectedSymptoms.length ? `Story symptoms: ${detectedSymptoms.slice(0, 5).join(", ")}` : "",
        painPoints[0] ? `Patient pain point: ${painPoints[0]}` : "",
      ]);
      insights.push({
        title: "Primary Concern Summary",
        description: `Your current analysis is centered on ${mainConcern || detectedSymptoms.slice(0, 3).join(", ") || "the symptoms you described"}. The useful next step is to connect when it happens, what worsens it, and what has already been tried so a clinician can review the pattern without starting from scratch.`,
        evidence,
        confidence: confidence(60, evidence.length),
        type: "info",
        department: departments[0]?.dept || "General Medicine",
        surveyFactors: compact([mainConcern, symptomPattern, careGoal]),
        storyFactors: compact([storyAnalysis.patternSummary, painPoints[0]]),
        lifestyleFactors: compact([dailyRoutine, travelTime]),
      });
    }

    if (trackerLogs.length > 0) {
      const evidence = compact([
        `${trackerLogs.length} tracker log${trackerLogs.length === 1 ? "" : "s"} found in DB`,
        fatigueAvg ? `Average fatigue: ${fatigueAvg}/10` : "",
        painAvg ? `Average pain: ${painAvg}/10` : "",
        brainFogAvg ? `Average brain fog: ${brainFogAvg}/10` : "",
      ]);
      insights.push({
        title: "Tracker Pattern From Your Logs",
        description: `Your tracker history gives a measurable baseline instead of relying only on memory. ${fatigueAvg || painAvg ? "The current averages can be used to compare future logs after changes in routine, treatment, food, sleep, or travel." : "Keep logging for a few more days to make trend detection stronger."}`,
        evidence,
        confidence: confidence(58, evidence.length + Math.min(3, trackerLogs.length)),
        type: fatigueAvg >= 7 || painAvg >= 7 ? "warning" : "info",
        department: departments[0]?.dept || "General Medicine",
        surveyFactors: compact([mainConcern]),
        lifestyleFactors: compact([dailyRoutine, travelTime]),
        storyFactors: compact([storyAnalysis.patternSummary]),
      });
    }

    if (sleepAvg || waterAvg || travelTime || occupation || dailyRoutine) {
      const evidence = compact([
        occupation ? `Occupation: ${occupation}` : "",
        dailyRoutine ? `Routine: ${dailyRoutine}` : "",
        travelTime ? `Travel time: ${travelTime}` : "",
        sleepAvg ? `Average sleep: ${sleepAvg} hours` : "",
        waterAvg ? `Average water: ${waterAvg}` : "",
      ]);
      insights.push({
        title: "Routine And Lifestyle Context",
        description: `Your routine context is part of the health picture. Commute time, work pattern, sleep, hydration, and symptom timing can explain why symptoms flare on some days and settle on others.`,
        evidence,
        confidence: confidence(55, evidence.length),
        type: "info",
        department: "General Medicine",
        surveyFactors: compact([occupation, dailyRoutine, travelTime]),
        lifestyleFactors: evidence,
        storyFactors: [],
      });
    }

    if (departments.length > 0 || careGoal) {
      const firstDept = departments[0];
      const evidence = compact([
        careGoal ? `Care goal: ${careGoal}` : "",
        firstDept?.dept ? `Suggested department from story: ${firstDept.dept}` : "",
        firstDept?.reason ? `Reason: ${firstDept.reason}` : "",
      ]);
      insights.push({
        title: "Next Care Step",
        description: `The next step should match your stated goal: ${careGoal || "clarifying the right clinical direction"}. Bring the survey summary, story analysis, and tracker averages together so the consultation focuses on unresolved questions rather than repeating the same history.`,
        evidence,
        confidence: confidence(57, evidence.length),
        type: "success",
        department: firstDept?.dept || "General Medicine",
        surveyFactors: compact([careGoal]),
        lifestyleFactors: compact([occupation, travelTime]),
        storyFactors: compact([firstDept?.reason, storyAnalysis.patternSummary]),
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: "More User Data Needed",
        description: "No saved survey, story, or tracker details were found for this user yet. Complete the survey and patient story first so EchoCare can generate patient-specific insights.",
        evidence: ["No DB-backed health context available"],
        confidence: 52,
        type: "info",
        department: "General Medicine",
        surveyFactors: [],
        lifestyleFactors: [],
        storyFactors: storyText ? [String(storyText).slice(0, 120)] : [],
      });
    }

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

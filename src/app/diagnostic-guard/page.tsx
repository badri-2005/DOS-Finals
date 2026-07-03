"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useMemo } from "react";
import { fetchFromBackend } from "@/lib/backend";
import { 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight, 
  FileText, 
  Calendar, 
  User, 
  FileCheck, 
  Sparkles, 
  Printer, 
  Scale, 
  Info, 
  X, 
  Plus, 
  Search, 
  History, 
  UserCheck, 
  FileSpreadsheet, 
  Download,
  AlertTriangle,
  Users,
  Upload
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceDot
} from "recharts";

// 32 Weeks Timeline Database
const timelineMasterData = [
  { week: "Wk 1", fatigue: 4, jointPain: 2, brainFog: 3, dizziness: 2 },
  { week: "Wk 2", fatigue: 5, jointPain: 3, brainFog: 4, dizziness: 2 },
  { week: "Wk 3", fatigue: 5, jointPain: 3, brainFog: 4, dizziness: 2 },
  { week: "Wk 4", fatigue: 6, jointPain: 4, brainFog: 5, dizziness: 3 },
  { week: "Wk 5", fatigue: 6, jointPain: 4, brainFog: 5, dizziness: 3, event: "Primary CBC (Normal)" },
  { week: "Wk 6", fatigue: 7, jointPain: 5, brainFog: 6, dizziness: 3 },
  { week: "Wk 7", fatigue: 7, jointPain: 5, brainFog: 6, dizziness: 4 },
  { week: "Wk 8", fatigue: 8, jointPain: 6, brainFog: 7, dizziness: 4 },
  { week: "Wk 9", fatigue: 8, jointPain: 6, brainFog: 7, dizziness: 4 },
  { week: "Wk 10", fatigue: 7, jointPain: 5, brainFog: 6, dizziness: 3 },
  { week: "Wk 11", fatigue: 7, jointPain: 5, brainFog: 6, dizziness: 3 },
  { week: "Wk 12", fatigue: 7, jointPain: 6, brainFog: 7, dizziness: 4, event: "Thyroid Panel (TSH Normal)" },
  { week: "Wk 13", fatigue: 8, jointPain: 7, brainFog: 7, dizziness: 5 },
  { week: "Wk 14", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 15", fatigue: 9, jointPain: 8, brainFog: 8, dizziness: 6 },
  { week: "Wk 16", fatigue: 9, jointPain: 8, brainFog: 9, dizziness: 6 },
  { week: "Wk 17", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 18", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 19", fatigue: 7, jointPain: 6, brainFog: 7, dizziness: 4 },
  { week: "Wk 20", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5, event: "Brain MRI (Normal)" },
  { week: "Wk 21", fatigue: 9, jointPain: 8, brainFog: 9, dizziness: 6 },
  { week: "Wk 22", fatigue: 9, jointPain: 8, brainFog: 9, dizziness: 6 },
  { week: "Wk 23", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 24", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 25", fatigue: 7, jointPain: 6, brainFog: 7, dizziness: 4 },
  { week: "Wk 26", fatigue: 7, jointPain: 6, brainFog: 7, dizziness: 4 },
  { week: "Wk 27", fatigue: 8, jointPain: 7, brainFog: 8, dizziness: 5 },
  { week: "Wk 28", fatigue: 8, jointPain: 8, brainFog: 8, dizziness: 5 },
  { week: "Wk 29", fatigue: 9, jointPain: 8, brainFog: 9, dizziness: 6, event: "Consultation 3 (All Normal)" },
  { week: "Wk 30", fatigue: 9, jointPain: 9, brainFog: 9, dizziness: 7 },
  { week: "Wk 31", fatigue: 8, jointPain: 8, brainFog: 8, dizziness: 6 },
  { week: "Wk 32", fatigue: 8, jointPain: 8, brainFog: 8, dizziness: 6, event: "Today (Symptoms Persist)" },
];

const testMismatchDb: Record<string, { name: string; date: string; coverage: number; severity: string; discrepancy: string; advice: string }> = {
  "Wk 5": {
    name: "Primary CBC (Complete Blood Count)",
    date: "Dec 05, 2025",
    coverage: 33,
    severity: "Fatigue: 6/10 · Joint Pain: 4/10 · Brain Fog: 5/10",
    discrepancy: "Your GP closed the case as 'No Anemia' because Hemoglobin was in the normal range. However, Serum Ferritin (which checks actual iron stores) and Active B12 were completely omitted. You can have severely depleted cellular iron stores without showing visible anemia on standard screens.",
    advice: "Do not accept 'normal blood tests' as the end of the line. Request a full Iron Panel + Serum Ferritin to check your body's cellular iron reserve levels."
  },
  "Wk 12": {
    name: "Thyroid Panel (TSH Screen)",
    date: "Jan 22, 2026",
    coverage: 25,
    severity: "Fatigue: 7/10 · Joint Pain: 6/10 · Brain Fog: 7/10",
    discrepancy: "Your TSH screen returned normal (2.1 mIU/L). No free metabolic hormones (Free T4, Free T3) or thyroid antibodies (TPOAb, TgAb) were checked. A normal TSH does not rule out subclinical thyroid deficiency or early-stage autoimmune Hashimoto's thyroiditis.",
    advice: "Ask your doctor to run a Complete Thyroid Panel—specifically requesting Free T3, Free T4, and Thyroid Peroxidase (TPO) Antibodies."
  },
  "Wk 20": {
    name: "Brain MRI Scan (Lying Flat)",
    date: "Mar 20, 2026",
    coverage: 30,
    severity: "Fatigue: 8/10 · Brain Fog: 8/10 · Dizziness: 5/10",
    discrepancy: "Your brain structure is healthy. However, a structural, lying-flat MRI scan cannot diagnose autonomic blood pooling, orthostatic heart rate spikes (POTS), or subclinical systemic inflammation.",
    advice: "If your dizziness and brain fog worsen when standing up, request autonomic testing (NASA Lean stand check or Tilt Table Test) instead of structural brain scans."
  },
  "Wk 29": {
    name: "Consultation 3 (Consensus Check)",
    date: "Jun 18, 2026",
    coverage: 20,
    severity: "Fatigue: 9/10 · Joint Pain: 8/10 · Brain Fog: 9/10 · Dizziness: 6/10",
    discrepancy: "Three separate doctors concluded normal tests mean 'no physical disease,' referring your case to counseling. However, crucial testing layers (metabolic profile, immune markers, autonomic heart rate variance) were completely left unchecked.",
    advice: "Keep the case open. Trigger case escalation and request a diagnostic referral to a Rheumatologist or Autonomic Neurologist."
  }
};

const labAuditorList = [
  {
    name: "Thyroid Panel",
    verdict: "Normal TSH (2.1 mIU/L)",
    completeness: 25,
    tested: ["TSH (Pituitary screen)"],
    missing: [
      { name: "Free T3 (Active Hormone)", reason: "Checks actual active metabolic hormone availability. TSH can remain normal while tissue levels are depleted.", id: "ft3" },
      { name: "Free T4 (Circulating Hormone)", reason: "Measures actual thyroid gland output. Essential to rule out secondary/central hypothyroidism.", id: "ft4" },
      { name: "TPO Antibodies (TPOAb)", reason: "Checks for autoimmune destruction of thyroid. Can be high and cause severe symptoms for years before TSH fails.", id: "tpo" },
      { name: "Thyroglobulin Antibodies (TgAb)", reason: "Secondary indicator for autoimmune thyroiditis (Hashimoto's).", id: "tgab" }
    ]
  },
  {
    name: "Iron & Blood Check (CBC)",
    verdict: "Normal Hemoglobin (13.2 g/dL)",
    completeness: 33,
    tested: ["Hemoglobin", "Red Cell Indices", "White Blood Cells"],
    missing: [
      { name: "Serum Ferritin", reason: "Measures total stored iron. Depleted ferritin causes severe fatigue and body aches even with normal hemoglobin.", id: "ferritin" },
      { name: "Total Iron Binding Capacity (TIBC)", reason: "Determines how well iron binds to transport proteins, confirming subclinical deficiency.", id: "tibc" },
      { name: "Vitamin D3 (Active)", reason: "Critical for musculoskeletal pain thresholds and immune system management. Often completely missed.", id: "vitd" },
      { name: "Vitamin B12 & Folate", reason: "Essential for central nervous system myelin integrity and cognitive processing speeds.", id: "b12" }
    ]
  },
  {
    name: "Brain MRI Scan",
    verdict: "Normal Brain structure",
    completeness: 30,
    tested: ["Lying flat structural scan"],
    missing: [
      { name: "MRI with Contrast", reason: "Required to highlight active micro-inflammation or blood-brain barrier permeability gaps.", id: "contrast" },
      { name: "NASA Lean Test (Autonomic)", reason: "A simple orthostatic stand check to evaluate POTS/Dysautonomia, since MRIs cannot check heart rate postural swings.", id: "nasalean" },
      { name: "C-Reactive Protein (CRP / ESR)", reason: "Systemic inflammatory markers that indicate autoimmune flares which MRIs cannot scan.", id: "crp" }
    ]
  }
];

const subjectiveTranslators = [
  {
    subjective: "Brain Fog",
    clinical: "Executive Cognitive Dysfunction & Derealization",
    code: "ICD-10 R41.841",
    scale: "FACIT-Fatigue Scale / SF-36 Cognitive Subscale",
    desc: "Persistent deficit in working memory, executive planning, and cognitive processing speed. Often linked to reduced cerebral blood flow or subclinical neuroinflammation.",
    examples: ["feel like head is in a bubble", "can't find words", "detached from surroundings"]
  },
  {
    subjective: "Dizzy Standing Up",
    clinical: "Orthostatic Intolerance & Postural Tachycardia",
    code: "ICD-10 I49.8",
    scale: "COMPASS-31 Autonomic Score / Orthostatic Stand Test",
    desc: "Autonomic instability characterized by inadequate cardiovascular compensation when transitioning to an upright posture, leading to cerebral hypoperfusion.",
    examples: ["lightheaded when standing", "heart races standing up", "black out briefly standing"]
  },
  {
    subjective: "Heavy Limbs",
    clinical: "Proximal Motor Lethargy & Exertional Myasthenia",
    code: "ICD-10 G70.9",
    scale: "Hand Grip Dynamometer / Muscle Severity Index",
    desc: "Subjective sensation of extreme muscular resistance and torque fatigue, typically without clinical atrophy, indicating metabolic or neuro-immunological fatigue.",
    examples: ["legs feel like lead", "arms heavy as stone", "exhausted brushing my hair"]
  },
  {
    subjective: "Aches All Over",
    clinical: "Symmetric Connective Tissue Arthralgia & Myalgia",
    code: "ICD-10 M79.1",
    scale: "Fibromyalgia Impact Questionnaire (FIQR)",
    desc: "Widespread pain affecting both sides of the body, above and below the waist, reflecting possible central pain sensitization or early connective tissue dysfunction.",
    examples: ["joints ache constantly", "widespread muscle throbbing", "body feels bruised"]
  }
];

const initialDoctorOpinions = [
  {
    doctor: "Dr. A. Johnson",
    specialty: "Primary Care (GP)",
    verdict: "Normal / Psychosomatic",
    notes: "Basic blood work normal. Patient reports high stress. Suggested counseling and mild anxiety medication.",
    date: "Nov 12, 2025",
    ignoredSymptoms: "Persistent joint swelling, fluctuating body temperature."
  },
  {
    doctor: "Dr. S. Mehta",
    specialty: "Endocrinologist",
    verdict: "Healthy / Case Closed",
    notes: "TSH is 2.1 which is perfectly normal. No endocrine disorder present. Advised sleep hygiene.",
    date: "Dec 18, 2025",
    ignoredSymptoms: "Daytime exhaustion despite 9 hours sleep, dry skin, cold sensitivity."
  },
  {
    doctor: "Dr. K. Williams",
    specialty: "Neurologist",
    verdict: "No Neurological Cause",
    notes: "Brain MRI normal. Standard physical reflex exam normal. No evidence of MS or neuropathy. Refer back to GP.",
    date: "Feb 26, 2026",
    ignoredSymptoms: "Sensation of head being under water (brain fog), dizziness upon standing."
  }
];

type SurveyContext = Record<string, string | string[] | number | undefined>;

type StoryAnalysisContext = Partial<{
  detectedSymptoms: string[];
  painPoints: string[];
  lifestylePatterns: string[];
  patternSummary: string;
  confidenceScore: number;
  recommendedActions: string[];
  sourceTimeline: Array<{ week?: string; event?: string; fatigue?: number; jointPain?: number; brainFog?: number; dizziness?: number }>;
  clinicalGaps: Array<{ week?: string; name?: string; date?: string; severity?: string; discrepancy?: string; advice?: string; coverage?: number }>;
}>;

type TrackerLog = {
  date?: string;
  fatigue?: number;
  joint_pain?: number;
  brain_fog?: number;
  dizziness?: number;
  notes?: string;
};

type DiagnosticReport = {
  id: string;
  backendId?: string;
  name: string;
  doctor: string;
  specialty: string;
  reportType: string;
  reportDate: string;
  status: "pending-cloudinary" | "uploaded" | "analyzed" | "error";
  cloudinaryUrl?: string;
  extractedText?: string;
  summary?: string;
};

type SymptomSlot = { key: string; label: string; color: string; bg: string };
type TimelinePoint = { week: string; event?: string; eventId?: string; [key: string]: string | number | undefined };
type MismatchAudit = { name: string; date: string; coverage: number; severity: string; discrepancy: string; advice: string };

const symptomColors = [
  { color: "#0F766E", bg: "rgba(15,118,110,0.06)" },
  { color: "#3B82F6", bg: "rgba(59,130,246,0.06)" },
  { color: "#8B5CF6", bg: "rgba(139,92,246,0.06)" },
  { color: "#F59E0B", bg: "rgba(245,158,11,0.06)" }
];

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function uniqueCompact(values: Array<string | undefined | null>, limit = 8) {
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

function sentenceFrom(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function buildSymptomSlots(survey: SurveyContext, story: StoryAnalysisContext): SymptomSlot[] {
  const surveySymptoms = Array.isArray(survey.symptoms) ? survey.symptoms.map(String) : [];
  const detected = Array.isArray(story.detectedSymptoms) ? story.detectedSymptoms : [];
  const labels = uniqueCompact([...detected, ...surveySymptoms, typeof survey.mainConcern === "string" ? survey.mainConcern : undefined], 4);
  return labels.slice(0, 4).map((label, index) => ({
    key: `symptom${index + 1}`,
    label,
    color: symptomColors[index].color,
    bg: symptomColors[index].bg
  }));
}

function normalizeReportDate(date?: string) {
  if (!date) return new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function buildTimeline(
  symptomSlots: SymptomSlot[],
  trackerLogs: TrackerLog[],
  story: StoryAnalysisContext,
  reports: DiagnosticReport[]
): TimelinePoint[] {
  if (symptomSlots.length === 0) return [];

  const logs = trackerLogs.slice(0, 8).reverse();
  if (logs.length >= 2) {
    return logs.map((log, index) => {
      const point: TimelinePoint = { week: log.date ? log.date.slice(5) : `Log ${index + 1}` };
      symptomSlots.forEach((slot, slotIndex) => {
        const lower = slot.label.toLowerCase();
        const value =
          lower.includes("joint") || lower.includes("pain") ? log.joint_pain :
          lower.includes("brain") || lower.includes("fog") || lower.includes("concentr") ? log.brain_fog :
          lower.includes("dizz") ? log.dizziness :
          log.fatigue;
        point[slot.key] = Math.max(1, Math.min(10, Number(value) || 4 + slotIndex));
      });
      return point;
    });
  }

  const sourceTimeline = Array.isArray(story.sourceTimeline) ? story.sourceTimeline : [];
  if (sourceTimeline.length >= 3) {
    return sourceTimeline.slice(-8).map((source, index) => {
      const point: TimelinePoint = { week: source.week || `Point ${index + 1}`, event: source.event };
      symptomSlots.forEach((slot, slotIndex) => {
        const lower = slot.label.toLowerCase();
        const value =
          lower.includes("joint") || lower.includes("pain") ? source.jointPain :
          lower.includes("brain") || lower.includes("fog") || lower.includes("concentr") ? source.brainFog :
          lower.includes("dizz") ? source.dizziness :
          source.fatigue;
        point[slot.key] = Math.max(1, Math.min(10, Number(value) || 4 + index + slotIndex * 0.5));
      });
      return point;
    });
  }

  const hasStoryOrReports = reports.length > 0 || (Array.isArray(story.painPoints) && story.painPoints.length > 0) || story.patternSummary;
  if (!hasStoryOrReports) return [];

  const painPointCount = Array.isArray(story.painPoints) ? story.painPoints.length : 0;
  const base = painPointCount > 2 ? 5 : 3;
  const points = Array.from({ length: 8 }, (_, index) => {
    const point: TimelinePoint = { week: `Wk ${index + 1}` };
    symptomSlots.forEach((slot, slotIndex) => {
      point[slot.key] = Math.min(10, base + index * 0.45 + slotIndex * 0.55);
    });
    return point;
  });

  reports.slice(0, 3).forEach((report, index) => {
    const target = Math.min(points.length - 1, 1 + index * 2);
    points[target].event = report.reportType || report.name;
    points[target].eventId = report.id;
  });

  return points;
}

function buildMismatchAudits(
  timeline: TimelinePoint[],
  symptomSlots: SymptomSlot[],
  story: StoryAnalysisContext,
  reports: DiagnosticReport[]
): Record<string, MismatchAudit> {
  const clinicalGaps = Array.isArray(story.clinicalGaps) ? story.clinicalGaps : [];
  const painPoints = Array.isArray(story.painPoints) ? story.painPoints : [];
  const fallbackConcern = painPoints[0] || story.patternSummary || "Symptoms are continuing after earlier checks, so this report should be audited against the symptom timeline.";

  const audits: Record<string, MismatchAudit> = {};
  const eventPoints = timeline.filter(point => point.event);
  eventPoints.forEach((point, index) => {
    const report = reports[index];
    const gap = clinicalGaps[index];
    const severity = symptomSlots
      .map(slot => `${slot.label}: ${Math.round(Number(point[slot.key]) || 0)}/10`)
      .join(" · ");

    audits[point.week] = {
      name: report?.reportType || gap?.name || String(point.event || "Prior diagnostic check"),
      date: normalizeReportDate(report?.reportDate || gap?.date),
      coverage: Math.max(20, Math.min(85, Number(gap?.coverage) || (report ? 45 : 35))),
      severity,
      discrepancy: sentenceFrom(
        gap?.discrepancy,
        `${fallbackConcern} The diagnostic event is a single report point, while the symptom curve shows ongoing burden. The mismatch to review is whether the report actually tested the markers relevant to the symptoms that continued afterward.`
      ),
      advice: sentenceFrom(
        gap?.advice,
        "Ask the clinician to compare this report with the symptom timeline and document which missing markers, functional tests, or specialist reviews are still needed."
      )
    };
  });

  return audits;
}

export default function RedesignedDiagnosticGuard() {
  const [surveyData, setSurveyData] = useState<SurveyContext>(() => readStoredJson<SurveyContext>("echocare-survey", {}));
  const [storyAnalysis, setStoryAnalysis] = useState<StoryAnalysisContext>(() => readStoredJson<StoryAnalysisContext>("echocare-story-analysis", {}));
  const [trackerLogs, setTrackerLogs] = useState<TrackerLog[]>([]);
  const [uploadedReports, setUploadedReports] = useState<DiagnosticReport[]>(() => readStoredJson<DiagnosticReport[]>("echocare-diagnostic-reports", []));
  const [reportDraft, setReportDraft] = useState({ doctor: "", specialty: "", reportType: "Lab report", reportDate: "" });

  const [timeRange, setTimeRange] = useState<"3M" | "6M" | "8M">("8M");
  const [visibleSymptoms, setVisibleSymptoms] = useState<Record<string, boolean>>({
    symptom1: true,
    symptom2: true,
    symptom3: true,
    symptom4: false,
  });

  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>("Wk 12");
  const [activeAuditorIdx, setActiveAuditorIdx] = useState(0);
  const [requestedMarkers, setRequestedMarkers] = useState<string[]>(() => readStoredJson<string[]>("echocare-requested-markers", []));

  const [doctorOpinions, setDoctorOpinions] = useState<typeof initialDoctorOpinions>(() => readStoredJson<typeof initialDoctorOpinions>("echocare-doctor-opinions", []));
  const [showOpinionForm, setShowOpinionForm] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", specialty: "", verdict: "", notes: "", ignored: "", date: "" });
  const [savingDoc, setSavingDoc] = useState(false);

  const [searchTranslation, setSearchTranslation] = useState("");
  const [activeTranslationIdx, setActiveTranslationIdx] = useState<number | null>(0);
  const [caseEscalated, setCaseEscalated] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("echocare-case-escalated") !== "false";
  });
  const [showBriefModal, setShowBriefModal] = useState(false);

  const symptomSlots = useMemo(() => buildSymptomSlots(surveyData, storyAnalysis), [surveyData, storyAnalysis]);
  const patientTimeline = useMemo(
    () => buildTimeline(symptomSlots, trackerLogs, storyAnalysis, uploadedReports),
    [symptomSlots, trackerLogs, storyAnalysis, uploadedReports]
  );
  const mismatchAudits = useMemo(
    () => buildMismatchAudits(patientTimeline, symptomSlots, storyAnalysis, uploadedReports),
    [patientTimeline, symptomSlots, storyAnalysis, uploadedReports]
  );
  const firstMismatchKey = Object.keys(mismatchAudits)[0] ?? patientTimeline.find(point => point.event)?.week ?? null;
  const effectiveSelectedNodeKey = selectedNodeKey && mismatchAudits[selectedNodeKey] ? selectedNodeKey : firstMismatchKey;
  const activeTestDetails = useMemo(() => {
    if (!effectiveSelectedNodeKey) return null;
    return mismatchAudits[effectiveSelectedNodeKey] ?? null;
  }, [effectiveSelectedNodeKey, mismatchAudits]);
  const activeAuditor = labAuditorList[activeAuditorIdx];
  const patientPainPoints = Array.isArray(storyAnalysis.painPoints) ? storyAnalysis.painPoints : [];
  const patientDetectedSymptoms = symptomSlots.map(slot => slot.label);
  const patientDuration = patientTimeline.length >= 8 ? "8 timeline points" : `${patientTimeline.length} timeline points`;
  const activeGapCount = Object.keys(mismatchAudits).length + requestedMarkers.length;

  useEffect(() => {
    const loadBackendContext = async () => {
      try {
        const [surveyRes, storyRes, trackerRes] = await Promise.all([
          fetchFromBackend("/api/survey"),
          fetchFromBackend("/api/story/latest"),
          fetchFromBackend("/api/tracker/history"),
        ]);

        if (surveyRes.ok) {
          const survey = await surveyRes.json();
          if (survey && typeof survey === "object") setSurveyData(survey);
        }

        if (storyRes.ok) {
          const story = await storyRes.json();
          const analysis = story?.analysis || story?.ai_analysis;
          if (analysis && typeof analysis === "object") {
            setStoryAnalysis(analysis);
            if (typeof window !== "undefined") {
              localStorage.setItem("echocare-story-analysis", JSON.stringify(analysis));
            }
          }
        }

        if (trackerRes.ok) {
          const tracker = await trackerRes.json();
          const logs = Array.isArray(tracker) ? tracker : tracker?.logs;
          if (Array.isArray(logs)) setTrackerLogs(logs);
        }
      } catch {
        // Local storage context keeps Diagnostic Guard usable when the API is offline.
      }
    };

    loadBackendContext();
  }, []);

  const handleToggleEscalation = () => {
    const nextState = !caseEscalated;
    setCaseEscalated(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("echocare-case-escalated", String(nextState));
    }
  };

  const handleToggleMarker = (markerName: string) => {
    let nextMarkers = [...requestedMarkers];
    if (nextMarkers.includes(markerName)) {
      nextMarkers = nextMarkers.filter(m => m !== markerName);
    } else {
      nextMarkers.push(markerName);
    }
    setRequestedMarkers(nextMarkers);
    if (typeof window !== "undefined") {
      localStorage.setItem("echocare-requested-markers", JSON.stringify(nextMarkers));
    }
  };

  const handleAddOpinion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.name || !newDoc.specialty || !newDoc.verdict) return;
    setSavingDoc(true);

    const added = {
      doctor: newDoc.name,
      specialty: newDoc.specialty,
      verdict: newDoc.verdict,
      notes: newDoc.notes || "Standard exam check normal.",
      date: newDoc.date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      ignoredSymptoms: newDoc.ignored || "Fatigue patterns ignored."
    };

    const updated = [...doctorOpinions, added];
    setTimeout(() => {
      setDoctorOpinions(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("echocare-doctor-opinions", JSON.stringify(updated));
      }
      setNewDoc({ name: "", specialty: "", verdict: "", notes: "", ignored: "", date: "" });
      setShowOpinionForm(false);
      setSavingDoc(false);
    }, 600);
  };

  const handleLocalReportAttach = (files: FileList | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter(file => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));
    const added = pdfs.map(file => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      doctor: reportDraft.doctor,
      specialty: reportDraft.specialty,
      reportType: reportDraft.reportType,
      reportDate: reportDraft.reportDate || new Date().toISOString().slice(0, 10),
      status: "pending-cloudinary" as const,
    }));
    const nextReports = [...added, ...uploadedReports];
    setUploadedReports(nextReports);
    if (typeof window !== "undefined") {
      localStorage.setItem("echocare-diagnostic-reports", JSON.stringify(nextReports));
    }
  };

  const filteredTimeline = useMemo(() => {
    let sliceLength = patientTimeline.length;
    if (timeRange === "3M") sliceLength = Math.min(12, patientTimeline.length);
    if (timeRange === "6M") sliceLength = Math.min(24, patientTimeline.length);
    return patientTimeline.slice(Math.max(0, patientTimeline.length - sliceLength));
  }, [patientTimeline, timeRange]);

  const filteredTranslations = useMemo(() => {
    if (!searchTranslation) return subjectiveTranslators;
    return subjectiveTranslators.filter(t => 
      t.subjective.toLowerCase().includes(searchTranslation.toLowerCase()) || 
      t.clinical.toLowerCase().includes(searchTranslation.toLowerCase())
    );
  }, [searchTranslation]);

  const primaryAvg = patientTimeline.length && symptomSlots[0]
    ? (patientTimeline.reduce((acc, curr) => acc + (Number(curr[symptomSlots[0].key]) || 0), 0) / patientTimeline.length).toFixed(1)
    : "0.0";
  const secondaryAvg = patientTimeline.length && symptomSlots[1]
    ? (patientTimeline.reduce((acc, curr) => acc + (Number(curr[symptomSlots[1].key]) || 0), 0) / patientTimeline.length).toFixed(1)
    : "0.0";

  return (
    <AppLayout 
      title="Diagnostic Guard Hub" 
      subtitle="Expose un-investigated gaps, cross-check doctor contradictions, and build clinical evidence."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "32px", maxWidth: "1100px", margin: "0 auto", paddingBottom: "60px" }}>
        
        {/* 1. PROTOCOL STATUS CARD */}
        <div className="card" style={{
          padding: "32px",
          background: "white",
          borderLeft: caseEscalated ? "6px solid #EF4444" : "6px solid #0F766E",
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "12px",
                  background: caseEscalated ? "rgba(239,68,68,0.06)" : "rgba(15,118,110,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: caseEscalated ? "#EF4444" : "#0F766E", flexShrink: 0
                }}>
                  <ShieldAlert size={28} className={caseEscalated ? "animate-pulse" : ""} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.02em" }}>Clinical Case Advocacy Status</span>
                    <span style={{
                      fontSize: "10px", fontWeight: 800, padding: "4px 12px", borderRadius: "100px",
                      background: caseEscalated ? "#EF4444" : "#0F766E", color: "white", textTransform: "uppercase", letterSpacing: "0.08em"
                    }}>
                      {caseEscalated ? "Case Active & Escalated" : "Case Resolved"}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#475569", marginTop: "6px", lineHeight: 1.6 }}>
                    EchoCare uses your survey, patient story, tracker logs, and uploaded reports to keep unresolved symptoms visible until the report gaps and specialist conflicts are reviewed.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button 
                  onClick={handleToggleEscalation}
                  style={{
                    padding: "10px 18px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 700,
                    background: caseEscalated ? "rgba(239,68,68,0.06)" : "#0F766E",
                    color: caseEscalated ? "#EF4444" : "white",
                    border: caseEscalated ? "1.5px solid #EF4444" : "none",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {caseEscalated ? "Dismiss Escalation" : "Re-Open & Escalate Case"}
                </button>
                <button 
                  onClick={() => setShowBriefModal(true)}
                  style={{
                    padding: "10px 18px", borderRadius: "10px", fontSize: "12.5px", fontWeight: 700,
                    background: "#0F766E", color: "white", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(15,118,110,0.2)"
                  }}
                >
                  <Printer size={14} /> Export Advocacy Brief
                </button>
              </div>
            </div>

            <div style={{ height: "1px", background: "#E2E8F0" }} />

            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", fontSize: "13px", color: "#475569" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertCircle size={15} color="#EF4444" />
                <span>Active Gaps: <strong style={{ color: "#0F172A" }}>{activeGapCount} user-linked items</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Users size={15} color="#8B5CF6" />
                <span>Specialist Gaps: <strong style={{ color: "#0F172A" }}>{doctorOpinions.length} logged opinions</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <History size={15} color="#3B82F6" />
                <span>Chronological Evidence: <strong style={{ color: "#0F172A" }}>{patientDuration}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                <Upload size={18} color="#0F766E" />
                Report Attachments for Diagnostic Guard
              </h3>
              <p style={{ fontSize: "13.5px", color: "#475569", marginTop: "4px", lineHeight: 1.6 }}>
                Add every PDF report from each doctor with source details. Reports uploaded from the Reports page are reused here for mismatch analysis.
              </p>
            </div>
            <span className="badge badge-muted">{uploadedReports.length} attached</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <input className="form-input" placeholder="Doctor / hospital" value={reportDraft.doctor} onChange={e => setReportDraft({ ...reportDraft, doctor: e.target.value })} />
            <input className="form-input" placeholder="Specialty" value={reportDraft.specialty} onChange={e => setReportDraft({ ...reportDraft, specialty: e.target.value })} />
            <select className="form-input" value={reportDraft.reportType} onChange={e => setReportDraft({ ...reportDraft, reportType: e.target.value })}>
              <option>Lab report</option>
              <option>Scan / Imaging</option>
              <option>Prescription</option>
              <option>Specialist opinion</option>
              <option>Discharge summary</option>
            </select>
            <input type="date" className="form-input" value={reportDraft.reportDate} onChange={e => setReportDraft({ ...reportDraft, reportDate: e.target.value })} />
          </div>

          <label style={{ border: "1.5px dashed #CBD5E1", borderRadius: "14px", padding: "18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", color: "#0F766E", fontSize: "13px", fontWeight: 750, background: "#F8FAFC" }}>
            <Upload size={16} />
            Attach multiple PDF reports for Cloudinary-backed analysis
            <input type="file" multiple accept=".pdf,application/pdf" style={{ display: "none" }} onChange={e => handleLocalReportAttach(e.target.files)} />
          </label>

          {uploadedReports.length === 0 ? (
            <div style={{ padding: "18px", borderRadius: "12px", background: "#F8FAFC", color: "#64748B", fontSize: "13px", border: "1px solid #E2E8F0" }}>
              No report PDFs are attached yet. Upload reports from this card or from Medical Reports so Diagnostic Guard can compare tests against ongoing symptoms.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {uploadedReports.map(report => (
                <div key={report.id} style={{ padding: "14px", borderRadius: "12px", border: "1.5px solid #E2E8F0", background: "white" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#0F172A", marginBottom: "6px" }}>{report.name}</div>
                  <div style={{ fontSize: "11.5px", color: "#64748B", lineHeight: 1.6 }}>
                    {report.reportType || "Report"} · {normalizeReportDate(report.reportDate)}
                    <br />
                    {report.doctor || "Doctor not added"} · {report.specialty || "Specialty not added"}
                  </div>
                  <div className={`badge badge-${report.status === "uploaded" ? "success" : "warning"}`} style={{ marginTop: "10px", fontSize: "10px" }}>
                    {report.cloudinaryUrl ? "Cloudinary synced" : "Pending Cloudinary sync"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. STEP 1: LONGITUDINAL SYMPTOM TIMELINE (SPACIOUS VERTICAL FLOW) */}
        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F766E", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(15,118,110,0.08)", padding: "4px 12px", borderRadius: "100px" }}>Step 1</span>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
              <Scale size={18} color="#0F766E" />
              Symptom Chronicity & Mismatch Explorer
            </h3>
            <p style={{ fontSize: "13.5px", color: "#475569", marginTop: "4px" }}>
              Compare your ongoing daily symptoms against single-point tests. Toggle lines to view symptoms. <strong>Click the orange test dots</strong> on the graph to audit why standard checks missed your symptoms.
            </p>
          </div>

          {/* Controls: Range & Symptom toggles */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px" }}>
            {/* Range */}
            <div style={{ display: "flex", background: "#F1F5F9", padding: "4px", borderRadius: "8px", gap: "4px" }}>
              {(["3M", "6M", "8M"] as const).map(r => (
                <button 
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
                    border: "none", cursor: "pointer",
                    background: timeRange === r ? "white" : "transparent",
                    color: timeRange === r ? "#0F766E" : "#64748B",
                    boxShadow: timeRange === r ? "0 2px 5px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  {r} View
                </button>
              ))}
            </div>

            {/* Symptom curve check buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {symptomSlots.length === 0 ? (
                <span style={{ fontSize: "12px", color: "#64748B" }}>Complete survey/story or upload reports to build symptom curves.</span>
              ) : symptomSlots.map(item => {
                const isActive = visibleSymptoms[item.key] ?? true;
                return (
                  <button
                    key={item.key}
                    onClick={() => setVisibleSymptoms(prev => ({ ...prev, [item.key]: !isActive }))}
                    style={{
                      padding: "6px 14px", borderRadius: "100px", fontSize: "12px", fontWeight: 700,
                      border: `1.5px solid ${isActive ? item.color : "#E2E8F0"}`,
                      background: isActive ? item.bg : "white",
                      color: isActive ? item.color : "#475569",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: item.color }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Graph wrapper */}
          <div style={{ height: "260px", width: "100%", background: "#FAFAFA", borderRadius: "16px", padding: "16px", border: "1px solid #F1F5F9" }}>
            {filteredTimeline.length === 0 ? (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#64748B", fontSize: "13px", lineHeight: 1.6 }}>
                No user-specific timeline yet. Add symptoms in the survey/story, daily tracker logs, or PDF reports to generate the chronicity and mismatch graph.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredTimeline} margin={{ top: 10, right: 10, left: -26, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} />
                  <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} />
                  <Tooltip content={() => null} />

                  {symptomSlots.map(slot => (
                    (visibleSymptoms[slot.key] ?? true) && <Line key={slot.key} type="monotone" dataKey={slot.key} stroke={slot.color} strokeWidth={3} dot={false} />
                  ))}

                  {filteredTimeline.filter(point => point.event).map(point => (
                    <ReferenceDot
                      key={point.week}
                      x={point.week}
                      y={Math.max(...symptomSlots.map(slot => Number(point[slot.key]) || 0), 4)}
                      r={7}
                      fill="#EA580C"
                      stroke="#fff"
                      strokeWidth={2}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedNodeKey(point.week)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Active test mismatch info box (Highly readable light design) */}
          {activeTestDetails ? (
            <div style={{
              padding: "24px", borderRadius: "16px",
              background: "#F8FAFC", border: "1.5px solid #E2E8F0",
              borderLeft: "5px solid #EA580C"
            }} className="animate-scale-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#EA580C", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tested Details Audit ({activeTestDetails.coverage}% Completeness)</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748B" }}>Date: {activeTestDetails.date}</span>
              </div>
              <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>{activeTestDetails.name}</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                  <strong>Peak Symptoms During Test:</strong> <span style={{ fontFamily: "monospace", color: "#0F766E", fontWeight: 700 }}>{activeTestDetails.severity}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6 }}>
                  <strong>Why Tissues Were Omitted (Discrepancy):</strong> {activeTestDetails.discrepancy}
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(15,118,110,0.05)", border: "1px solid rgba(15,118,110,0.1)", fontSize: "12.5px", color: "#0F766E", display: "flex", gap: "6px" }}>
                  <Info size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span><strong>Clinical Advice:</strong> {activeTestDetails.advice}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px", textAlign: "center", border: "1.5px dashed #E2E8F0", borderRadius: "12px", color: "#64748B", fontSize: "13px" }}>
              💡 Select any orange test dot on the timeline graph to view why standard findings conflicted with your actual symptoms.
            </div>
          )}
        </div>

        {/* 3. STEP 2: LAB REPORT AUDITOR & REQUISITION BUILDER (SPACIOUS SPLIT LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Lab Auditor (2 cols) */}
          <div className="card lg:col-span-2" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F766E", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(15,118,110,0.08)", padding: "4px 12px", borderRadius: "100px" }}>Step 2</span>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <FileCheck size={18} color="#0F766E" />
                Lab Report Completeness Auditor
              </h3>
              <p style={{ fontSize: "13.5px", color: "#475569", marginTop: "4px" }}>
                Standard lab reports often skip essential subclinical markers. Audit your reports below and select missing markers to compile your doctor request checklist.
              </p>
            </div>

            {/* Selector tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {labAuditorList.map((aud, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveAuditorIdx(i)}
                  style={{
                    padding: "16px", borderRadius: "16px", border: activeAuditorIdx === i ? "2px solid #0F766E" : "1.5px solid #E2E8F0",
                    background: activeAuditorIdx === i ? "rgba(15,118,110,0.01)" : "white",
                    cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 750, color: "#0F172A" }}>{aud.name}</div>
                    <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>{aud.verdict}</div>
                  </div>
                  {/* Progress ring */}
                  <div style={{ position: "relative", width: "40px", height: "40px" }} className="flex-shrink-0">
                    <svg viewBox="0 0 36 36" width="40" height="40">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={aud.completeness < 30 ? "#EF4444" : "#F59E0B"} strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 14}`}
                        strokeDashoffset={`${2 * Math.PI * 14 * (1 - aud.completeness / 100)}`}
                        strokeLinecap="round" transform="rotate(-90 18 18)" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#0F172A" }}>
                      {aud.completeness}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Missing markers checklist */}
            <div style={{ padding: "20px", borderRadius: "16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "13.5px", fontWeight: 750, color: "#0F172A" }}>Tested Indicators: <span style={{ fontWeight: 500, color: "#475569" }}>{activeAuditor.tested.join(", ")}</span></h4>
                </div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#EF4444", textTransform: "uppercase" }}>{100 - activeAuditor.completeness}% Untested Gap</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                {activeAuditor.missing.map(m => {
                  const isChecked = requestedMarkers.includes(m.name);
                  return (
                    <div 
                      key={m.id}
                      onClick={() => handleToggleMarker(m.name)}
                      style={{
                        padding: "14px", borderRadius: "12px", border: isChecked ? "2px solid #0F766E" : "1.5px solid #E2E8F0",
                        background: "white", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "flex-start", gap: "12px"
                      }}
                    >
                      <div style={{
                        width: "20px", height: "20px", borderRadius: "4px", border: "1.5px solid #94A3B8",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        background: isChecked ? "#0F766E" : "transparent", borderColor: isChecked ? "#0F766E" : "#94A3B8"
                      }}>
                        {isChecked && <CheckCircle size={12} color="white" />}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 750, color: "#0F172A" }}>{m.name}</div>
                        <p style={{ fontSize: "11.5px", color: "#475569", marginTop: "4px", lineHeight: 1.45 }}>{m.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* GP Requisition checklist sheet (1 col) */}
          <div className="card" style={{
            padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between",
            border: "2px dashed #CBD5E1", background: "#F8FAFC", boxShadow: "none"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "14.5px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FileText size={16} color="#0F766E" />
                  GP Request Checklist
                </h3>
                <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "100px", background: "rgba(15,118,110,0.1)", color: "#0F766E" }}>
                  {requestedMarkers.length} Selected
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", lineHeight: 1.5, marginBottom: "20px" }}>
                Review and select missing indicators on the left to add them here. Use the PDF print brief at your next visit.
              </p>
            </div>

            {requestedMarkers.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "space-between" }} className="animate-scale-in">
                <div style={{
                  background: "white", border: "1.5px solid #E2E8F0",
                  borderRadius: "12px", padding: "14px 16px", maxHeight: "200px", overflowY: "auto"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {requestedMarkers.map((marker, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px", paddingBottom: "6px", borderBottom: i < requestedMarkers.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                        <span style={{ fontWeight: 750, color: "#0F172A", display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F766E" }} />
                          {marker}
                        </span>
                        <button onClick={() => handleToggleMarker(marker)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowBriefModal(true)}
                  className="btn btn-primary"
                  style={{ width: "100%", fontSize: "13px", paddingTop: "10px", paddingBottom: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <Download size={14} /> Compile Requisition brief
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", flex: 1, color: "#64748B", padding: "20px 0" }}>
                <AlertCircle size={32} color="#0F766E" style={{ opacity: 0.3, marginBottom: "8px" }} />
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#475569" }}>Checklist Empty</div>
                <p style={{ fontSize: "12px", maxWidth: "200px", margin: "4px auto 0", lineHeight: 1.45 }}>Check omitted markers in the auditor tab on the left to add them to your checklist.</p>
              </div>
            )}

            <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #E2E8F0", fontSize: "11px", color: "#64748B", lineHeight: 1.5 }}>
              *Presenting standard reference ranges checking tissue-level markers makes it harder for GPs to dismiss unexplained symptoms.
            </div>
          </div>
        </div>

        {/* 4. STEP 3: DOCTOR CONSENSUS MATRIX */}
        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F766E", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(15,118,110,0.08)", padding: "4px 12px", borderRadius: "100px" }}>Step 3</span>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <UserCheck size={18} color="#0F766E" />
                Specialist Opinions & Conflict Audit
              </h3>
              <p style={{ fontSize: "13.5px", color: "#475569", marginTop: "4px" }}>
                Map contradictory diagnoses side-by-side to highlight indicators ignored by each practitioner.
              </p>
            </div>
            <button 
              onClick={() => setShowOpinionForm(!showOpinionForm)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px", border: "1px solid #E2E8F0" }}
            >
              <Plus size={13} /> Log Specialist Opinion
            </button>
          </div>

          {/* Log Opinion Form */}
          {showOpinionForm && (
            <form onSubmit={handleAddOpinion} style={{ padding: "24px", borderRadius: "16px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "16px" }} className="animate-scale-in">
              <div style={{ fontSize: "14px", fontWeight: 750, color: "#0F172A", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>Enter Doctor Opinion</div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Doctor Name</label>
                  <input type="text" required placeholder="e.g. Dr. Roberts" value={newDoc.name} onChange={e => setNewDoc({...newDoc, name: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Specialty</label>
                  <input type="text" required placeholder="e.g. Rheumatologist" value={newDoc.specialty} onChange={e => setNewDoc({...newDoc, specialty: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Verdict / Diagnosis</label>
                  <input type="text" required placeholder="e.g. Chronic Fatigue" value={newDoc.verdict} onChange={e => setNewDoc({...newDoc, verdict: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Consultation Date</label>
                  <input type="text" placeholder="e.g. Mar 2026" value={newDoc.date} onChange={e => setNewDoc({...newDoc, date: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Somatic Indicators Ignored</label>
                  <input type="text" placeholder="e.g. joint stiffness, postural dizziness" value={newDoc.ignored} onChange={e => setNewDoc({...newDoc, ignored: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "11px", fontWeight: 700 }}>Clinical Decision Rationale</label>
                  <input type="text" placeholder="e.g. Normal MRI, referred to sleep coach" value={newDoc.notes} onChange={e => setNewDoc({...newDoc, notes: e.target.value})} className="form-input" style={{ fontSize: "13px" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowOpinionForm(false)} className="btn btn-secondary btn-sm border dark:border-slate-800">Cancel</button>
                <button type="submit" disabled={savingDoc} className="btn btn-primary btn-sm font-bold">
                  {savingDoc ? "Saving..." : "✓ Log Opinion"}
                </button>
              </div>
            </form>
          )}

          {/* Grid stack */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {doctorOpinions.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", padding: "24px", borderRadius: "14px", border: "1.5px dashed #CBD5E1", color: "#64748B", fontSize: "13px", textAlign: "center" }}>
                No specialist opinions logged yet. Add each doctor verdict here so Diagnostic Guard can compare contradictions against the uploaded reports and ongoing symptoms.
              </div>
            ) : doctorOpinions.map((opinion, i) => (
              <div 
                key={i} 
                style={{
                  padding: "24px", borderRadius: "18px", border: "1.5px solid #E2E8F0",
                  background: "white", display: "flex", flexDirection: "column", justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <User size={15} color="#0F766E" />
                      <span style={{ fontSize: "14px", fontWeight: 750, color: "#0F172A" }}>{opinion.doctor}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: 700, fontFamily: "monospace" }}>{opinion.date}</span>
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#0F766E", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Specialty: <span style={{ fontWeight: 500, color: "#475569" }}>{opinion.specialty}</span>
                  </div>

                  <div style={{
                    padding: "8px 12px", borderRadius: "8px", background: "rgba(245,158,11,0.05)",
                    border: "1px solid rgba(245,158,11,0.15)", fontSize: "12.5px", fontWeight: 800,
                    color: "#D97706", marginBottom: "14px"
                  }}>
                    Verdict: {opinion.verdict}
                  </div>

                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: 1.6, fontStyle: "italic", marginBottom: "16px" }}>
                    &ldquo;{opinion.notes}&rdquo;
                  </p>
                </div>

                <div style={{ paddingTop: "10px", borderTop: "1px solid #F1F5F9", fontSize: "12px", color: "#EF4444", fontWeight: 700 }}>
                  <strong>Ignored Indicators:</strong> {opinion.ignoredSymptoms}
                </div>
              </div>
            ))}
          </div>

          {/* AI Conflict Warning */}
          <div style={{
            padding: "20px", borderRadius: "16px",
            background: "rgba(239,68,68,0.04)", border: "1.5px solid rgba(239,68,68,0.15)",
            display: "flex", gap: "12px"
          }}>
            <Scale size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#991B1B" }}>AI Joint Conflict Audit Analysis:</div>
              <p style={{ fontSize: "13px", color: "#B91C1C", lineHeight: 1.6, marginTop: "4px" }}>
                {doctorOpinions.length === 0
                  ? "No doctor verdicts have been logged yet. Once opinions are added, this audit will compare each conclusion against the symptom timeline, uploaded report text, and unresolved pain points."
                  : `${doctorOpinions.length} doctor opinion${doctorOpinions.length === 1 ? "" : "s"} logged. Diagnostic Guard will compare verdicts such as ${doctorOpinions.map(opinion => opinion.verdict).slice(0, 3).join(", ")} against ${patientDetectedSymptoms.join(", ") || "the user's symptoms"} and the uploaded report evidence.`}
              </p>
            </div>
          </div>
        </div>

        {/* 5. STEP 4: SYMPTOM TRANSLATOR (VERTICAL SEARCH LAYOUT) */}
        <div className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0F766E", letterSpacing: "0.08em", textTransform: "uppercase", background: "rgba(15,118,110,0.08)", padding: "4px 12px", borderRadius: "100px" }}>Step 4</span>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                <Sparkles size={18} color="#8B5CF6" />
                Symptom Translation Wizard
              </h3>
              <p style={{ fontSize: "13.5px", color: "#475569", marginTop: "4px" }}>
                Translate subjective complaints into standard clinical metrics, diagnostic scales, and ICD codes to explain findings clearly to your doctor.
              </p>
            </div>

            {/* Input Search */}
            <div style={{ position: "relative", width: "260px" }}>
              <input 
                type="text" 
                placeholder="Search symptom term..."
                value={searchTranslation}
                onChange={e => setSearchTranslation(e.target.value)}
                className="form-input" 
                style={{ fontSize: "13px", paddingLeft: "36px", borderRadius: "10px" }}
              />
              <Search size={14} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "12px" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2.8fr", gap: "24px", alignItems: "start" }}>
            {/* Sidebar list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredTranslations.map((item, idx) => (
                <button
                  key={item.subjective}
                  onClick={() => setActiveTranslationIdx(idx)}
                  style={{
                    padding: "14px 18px", borderRadius: "12px", textAlign: "left",
                    border: activeTranslationIdx === idx ? "2px solid #8B5CF6" : "1.5px solid #E2E8F0",
                    background: activeTranslationIdx === idx ? "rgba(139,92,246,0.03)" : "white",
                    color: activeTranslationIdx === idx ? "#8B5CF6" : "#475569",
                    cursor: "pointer", transition: "all 0.15s", fontSize: "13px", fontWeight: 700
                  }}
                >
                  {item.subjective}
                </button>
              ))}
            </div>

            {/* Translation details */}
            <div>
              {activeTranslationIdx !== null && filteredTranslations[activeTranslationIdx] ? (
                <div style={{
                  padding: "24px", borderRadius: "20px", border: "1.5px solid rgba(139,92,246,0.15)",
                  background: "rgba(139,92,246,0.01)", display: "flex", flexDirection: "column", gap: "16px"
                }} className="animate-scale-in">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "9px", fontWeight: 800, color: "#8B5CF6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Clinical Translation</span>
                      <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>
                        {filteredTranslations[activeTranslationIdx].clinical}
                      </h4>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "6px", background: "rgba(139,92,246,0.08)", color: "#8B5CF6", fontFamily: "monospace" }}>
                        {filteredTranslations[activeTranslationIdx].code}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 12px", borderRadius: "6px", background: "rgba(59,130,246,0.08)", color: "#3B82F6", fontFamily: "monospace" }}>
                        Active Scale
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: "4px" }}>Standard Evaluation Scale:</span>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#8B5CF6", fontFamily: "monospace" }}>
                      {filteredTranslations[activeTranslationIdx].scale}
                    </div>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#334155", lineHeight: 1.65 }}>
                    {filteredTranslations[activeTranslationIdx].desc}
                  </p>

                  <div style={{
                    padding: "12px 16px", borderRadius: "12px", background: "white",
                    border: "1px solid #E2E8F0", fontSize: "12px", color: "#64748B",
                    display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center"
                  }}>
                    <span>Subjective descriptions:</span>
                    {filteredTranslations[activeTranslationIdx].examples.map((ex, i) => (
                      <span key={i} style={{ padding: "3px 10px", background: "#F1F5F9", borderRadius: "6px", fontSize: "11.5px", fontStyle: "italic", border: "1px solid #E2E8F0" }}>
                        &quot;{ex}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: "13px" }}>
                  Select a symptom term from the menu to analyze clinical equivalents.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* PRINT ADVOCACY BRIEF MODAL */}
      {showBriefModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="card animate-scale-in" style={{
            background: "white", color: "black", width: "100%", maxWidth: "800px",
            maxHeight: "90vh", overflowY: "auto", padding: "40px", position: "relative",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)"
          }}>
            {/* Header controls */}
            <div className="no-print" style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", marginBottom: "24px", borderBottom: "1px solid #E2E8F0", paddingBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>Advocacy Brief Preview</h3>
                <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>Hand this directly to your specialist to challenge dismissive consultation patterns.</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  onClick={() => window.print()}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                    background: "#0F766E", color: "white", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  <Printer size={13} /> Print Memo
                </button>
                <button 
                  onClick={() => setShowBriefModal(false)}
                  style={{
                    padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                    background: "white", color: "#0F172A", border: "1.5px solid #E2E8F0", cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document contents wrapper */}
            <div id="print-area" style={{ fontFamily: "serif", color: "black", background: "white" }}>
              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  #print-area, #print-area * { visibility: visible; }
                  #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; margin: 0; color: black !important; background: white !important; }
                  .no-print { display: none !important; }
                }
              `}</style>
              
              <div style={{ borderBottom: "3px solid #0F172A", paddingBottom: "12px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h1 style={{ fontSize: "20px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.02em", margin: 0 }}>Clinical Case Advocacy Brief</h1>
                    <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#64748B" }}>Protocol Status: ACTIVE | CASE-REF: 32DD-F3FC-A069</span>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: "#475569" }}>
                    <div>Evidence Points: {patientTimeline.length}</div>
                    <div>Date Compiled: {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#475569", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "4px", marginBottom: "8px" }}>
                  1. Clinical Discrepancy Rationale
                </h2>
                <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#1E293B" }}>
                  The patient record currently highlights {patientDetectedSymptoms.join(", ") || "reported symptoms"} with average tracked burden around {primaryAvg}/10{symptomSlots[1] ? ` and ${secondaryAvg}/10` : ""}. Uploaded reports and logged doctor opinions are compared against the ongoing symptom timeline so single-point findings are not treated as the complete clinical picture.
                </p>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#475569", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "4px", marginBottom: "8px" }}>
                  2. Under-Testing Gaps Identified
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>Thyroid Profile Audit: 25% Complete</div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Omitted checks: Free T3 (active), Free T4 (circulating), TPO Antibodies, Thyroglobulin Antibodies.</div>
                    <p style={{ fontSize: "10.5px", color: "#64748B", fontStyle: "italic", marginTop: "4px" }}>*Clinical basis: Ruling out thyroid dysfunction based on TSH screen alone neglects secondary central hypothyroid depletion or autoimmune Hashimoto&apos;s antibodies.</p>
                  </div>
                  <div style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>Complete Blood Count (CBC) Audit: 33% Complete</div>
                    <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>Omitted checks: Serum Ferritin (iron storage), Vitamin D3, Vitamin B12 & Folate.</div>
                    <p style={{ fontSize: "10.5px", color: "#64748B", fontStyle: "italic", marginTop: "4px" }}>*Clinical basis: Normal hemoglobin levels exclude anemia, but fail to audit cellular iron storage. Depleted ferritin causes severe pain and muscle lethargy.</p>
                  </div>
                </div>
              </div>

              {requestedMarkers.length > 0 && (
                <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "8px", background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}>
                  <h2 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#0F766E", marginBottom: "8px" }}>
                    3. Recommended Diagnostic Requisitions
                  </h2>
                  <p style={{ fontSize: "11.5px", color: "#334155", marginBottom: "8px" }}>It is recommended to run the following indicators to resolve metabolic and autonomic testing gaps:</p>
                  <ul style={{ paddingLeft: "20px", fontSize: "11.5px", color: "#0F172A", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {requestedMarkers.map((m, i) => <li key={i} style={{ fontWeight: 700 }}>{m}</li>)}
                  </ul>
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <h2 style={{ fontSize: "12px", fontWeight: 800, textTransform: "uppercase", color: "#475569", borderBottom: "1.5px solid #E2E8F0", paddingBottom: "4px", marginBottom: "8px" }}>
                  4. Specialist Consensus Contradiction Grid
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {doctorOpinions.map((opinion, idx) => (
                    <div key={idx} style={{ fontSize: "11.5px", display: "grid", gridTemplateColumns: "1.5fr 1fr 2.5fr", gap: "10px", paddingBottom: "6px", borderBottom: "1px solid #F1F5F9" }}>
                      <span style={{ fontWeight: 700 }}>{opinion.doctor} ({opinion.specialty})</span>
                      <span style={{ fontWeight: 700, color: "#D97706" }}>{opinion.verdict}</span>
                      <span style={{ fontSize: "11px", color: "#475569" }}>
                        Decision: {opinion.notes} | Ignored: {opinion.ignoredSymptoms}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", borderTop: "1.5px solid #0F172A", paddingTop: "12px", marginTop: "32px", fontSize: "10px", color: "#64748B", fontFamily: "monospace" }}>
                <span>Report Compiled via EchoCare AI System</span>
                <span>Advocacy Protocol: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  );
}

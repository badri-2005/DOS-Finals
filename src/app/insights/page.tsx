"use client";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { Brain, TrendingUp, AlertCircle, Stethoscope, Info, Sparkles, ArrowRight, CheckCircle, BookOpen, Activity } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { HealthInsight } from "@/lib/gemini";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/backend";

const tabs = ["All Insights", "Physical", "Mental", "Lifestyle"];

type SurveyContext = Record<string, string | string[]>;
type StoryContext = Partial<{
  detectedSymptoms: string[];
  painPoints: string[];
  patternSummary: string;
  suggestedDepartments: { dept: string; reason: string; confidence: number }[];
}>;

type TrackerLog = {
  date?: string;
  fatigue?: number;
  joint_pain?: number;
  brain_fog?: number;
  dizziness?: number;
  mood?: string;
  sleep_hours?: number;
  water_intake?: number;
  notes?: string;
};

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

function average(values: number[]): number {
  const valid = values.filter(value => Number.isFinite(value));
  if (valid.length === 0) return 0;
  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function asPercent(value: number, max: number): number {
  if (!value) return 0;
  return Math.round(Math.min(100, Math.max(0, (value / max) * 100)));
}

function getTrackerMetrics(logs: TrackerLog[]) {
  const fatigueAvg = average(logs.map(log => Number(log.fatigue) || 0));
  const painAvg = average(logs.map(log => Number(log.joint_pain) || 0));
  const brainFogAvg = average(logs.map(log => Number(log.brain_fog) || 0));
  const sleepAvg = average(logs.map(log => Number(log.sleep_hours) || 0));
  const waterAvg = average(logs.map(log => Number(log.water_intake) || 0));
  return {
    fatigueAvg,
    painAvg,
    brainFogAvg,
    sleepAvg,
    waterAvg,
    moodAvg: logs[0]?.mood || "Not logged",
  };
}

function buildRadarData(logs: TrackerLog[], survey: SurveyContext) {
  const metrics = getTrackerMetrics(logs);
  return [
    { subject: "Sleep", A: metrics.sleepAvg ? asPercent(metrics.sleepAvg, 8) : 0 },
    { subject: "Hydration", A: metrics.waterAvg ? asPercent(metrics.waterAvg, 8) : 0 },
    { subject: "Pain Control", A: metrics.painAvg ? 100 - asPercent(metrics.painAvg, 10) : 0 },
    { subject: "Energy", A: metrics.fatigueAvg ? 100 - asPercent(metrics.fatigueAvg, 10) : 0 },
    { subject: "Routine", A: survey.dailyRoutine ? 70 : 0 },
    { subject: "Care Clarity", A: survey.careGoal ? 80 : 0 },
  ];
}

function buildTrendData(logs: TrackerLog[]) {
  return logs.slice(0, 8).reverse().map((log, index) => ({
    week: log.date ? log.date.slice(5) : `Log ${index + 1}`,
    fatigue: Number(log.fatigue) || 0,
    pain: Number(log.joint_pain) || 0,
    energy: Math.max(0, 10 - (Number(log.fatigue) || 0)),
  }));
}

function ExplainableReasoningBox({ surveyFactors, lifestyleFactors, storyFactors }: { surveyFactors: string[]; lifestyleFactors: string[]; storyFactors: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: "12px" }}>
      <button onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", padding: "0", fontFamily: "'Inter', sans-serif" }}>
        <BookOpen size={12} /> {open ? "Hide" : "Show"} AI Reasoning
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>▾</span>
      </button>
      {open && (
        <div style={{ marginTop: "10px", padding: "14px 16px", background: "rgba(59,130,246,0.04)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {surveyFactors.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#3B82F6", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 Survey Factors</div>
              {surveyFactors.map((f, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "6px", marginBottom: "3px" }}><span style={{ color: "#3B82F6" }}>•</span>{f}</div>)}
            </div>
          )}
          {lifestyleFactors.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#22C55E", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>🏃 Lifestyle Factors</div>
              {lifestyleFactors.map((f, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "6px", marginBottom: "3px" }}><span style={{ color: "#22C55E" }}>•</span>{f}</div>)}
            </div>
          )}
          {storyFactors.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#8B5CF6", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📖 Story Factors</div>
              {storyFactors.map((f, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", gap: "6px", marginBottom: "3px" }}><span style={{ color: "#8B5CF6" }}>•</span>{f}</div>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [remoteInsights, setRemoteInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [surveyData, setSurveyData] = useState<SurveyContext>(() => readStoredJson<SurveyContext>("echocare-survey", {}));
  const [storyAnalysis, setStoryAnalysis] = useState<StoryContext>(() => readStoredJson<StoryContext>("echocare-story-analysis", {}));
  const [trackerLogs, setTrackerLogs] = useState<TrackerLog[]>([]);
  const [dataAvailable, setDataAvailable] = useState(() => ({
    survey: typeof window !== "undefined" && !!window.localStorage.getItem("echocare-survey"),
    story: typeof window !== "undefined" && (!!window.localStorage.getItem("echocare-story") || !!window.localStorage.getItem("echocare-story-analysis")),
    tracker: typeof window !== "undefined" && !!window.localStorage.getItem("echocare-tracker-log"),
  }));

  const filteredInsights = activeTab === 0 ? remoteInsights :
    activeTab === 1 ? remoteInsights.filter(insight => /pain|fatigue|sleep|stomach|digest|body|physical|rheumat|gastro|general/i.test(`${insight.title} ${insight.description} ${insight.department ?? ""}`)) :
    activeTab === 2 ? remoteInsights.filter(insight => /stress|mood|anxiety|mental|work|emotion|focus/i.test(`${insight.title} ${insight.description} ${insight.department ?? ""}`)) :
    remoteInsights.filter(insight => /routine|travel|food|diet|hydration|activity|sleep|lifestyle/i.test(`${insight.title} ${insight.description}`));

  const radarData = buildRadarData(trackerLogs, surveyData);
  const trendData = buildTrendData(trackerLogs);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setError("");
      let nextSurvey = readStoredJson<SurveyContext>("echocare-survey", {});
      let nextStoryText = window.localStorage.getItem("echocare-story") || "";
      let nextStoryAnalysis = readStoredJson<StoryContext>("echocare-story-analysis", {});
      let nextTrackerLogs: TrackerLog[] = [];

      try {
        const surveyRes = await fetchFromBackend("/api/survey");
        if (surveyRes.ok) {
          const surveyJson = await surveyRes.json();
          if (surveyJson?.survey_data) {
            nextSurvey = surveyJson.survey_data;
            localStorage.setItem("echocare-survey", JSON.stringify(nextSurvey));
          }
        }
      } catch {}

      try {
        const storyRes = await fetchFromBackend("/api/story/latest");
        if (storyRes.ok) {
          const storyJson = await storyRes.json();
          if (storyJson?.story_text) {
            nextStoryText = storyJson.story_text;
            localStorage.setItem("echocare-story", storyJson.story_text);
          }
        }
      } catch {}

      try {
        const trackerRes = await fetchFromBackend("/api/tracker/history");
        if (trackerRes.ok) {
          const trackerJson = await trackerRes.json();
          nextTrackerLogs = Array.isArray(trackerJson) ? trackerJson : [];
        }
      } catch {}

      if (nextTrackerLogs.length === 0) {
        const trackerStored = window.localStorage.getItem("echocare-tracker-log");
        if (trackerStored) {
          try {
            const parsed = JSON.parse(trackerStored);
            nextTrackerLogs = [{
              fatigue: parsed.energy ? 10 - Number(parsed.energy) : undefined,
              joint_pain: Number(parsed.pain) || undefined,
              mood: parsed.mood,
              sleep_hours: Number(parsed.sleep) || undefined,
              water_intake: Number(parsed.water) || undefined,
              notes: parsed.notes,
            }];
          } catch {}
        }
      }

      if (!Object.keys(nextStoryAnalysis).length && nextStoryText.trim().length > 30) {
        try {
          const analysisRes = await fetch("/api/analyze-story", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ story: nextStoryText, surveyData: nextSurvey }),
          });
          if (analysisRes.ok) {
            nextStoryAnalysis = await analysisRes.json();
            localStorage.setItem("echocare-story-analysis", JSON.stringify(nextStoryAnalysis));
          }
        } catch {}
      }

      setSurveyData(nextSurvey);
      setStoryAnalysis(nextStoryAnalysis);
      setTrackerLogs(nextTrackerLogs);
      setDataAvailable({ survey: Object.keys(nextSurvey).length > 0, story: !!nextStoryText || Object.keys(nextStoryAnalysis).length > 0, tracker: nextTrackerLogs.length > 0 });

      const surveySymptoms = Array.isArray(nextSurvey.symptoms) ? nextSurvey.symptoms.map(String) : [];
      const storySymptoms = Array.isArray(nextStoryAnalysis.detectedSymptoms) ? nextStoryAnalysis.detectedSymptoms.map(String) : [];
      const symptoms = [...new Set([...surveySymptoms, ...storySymptoms])];
      if (symptoms.length === 0 && typeof nextSurvey.mainConcern === "string" && nextSurvey.mainConcern.trim()) {
        symptoms.push(nextSurvey.mainConcern);
      }
      if (symptoms.length === 0 && nextStoryText.trim()) {
        symptoms.push(nextStoryText.slice(0, 140));
      }

      const metrics = getTrackerMetrics(nextTrackerLogs);
      try {
        const response = await fetch("/api/health-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms,
            sleepAvg: metrics.sleepAvg,
            stressAvg: metrics.fatigueAvg,
            waterAvg: metrics.waterAvg,
            moodAvg: metrics.moodAvg,
            surveyData: nextSurvey,
            storyAnalysis: nextStoryAnalysis,
            trackerHistory: nextTrackerLogs,
            storyText: nextStoryText,
          }),
        });
        const result = await response.json();
        if (!response.ok || result.error) throw new Error(result.error || "Unable to load AI insights");
        setRemoteInsights(result.insights ?? []);
      } catch (err) {
        setError((err as Error).message || "Unable to load AI insights");
      } finally { setLoading(false); }
    }
    fetchInsights();
  }, []);

  const contextGrid = [
    { label: "Patient", value: surveyData.name || "Not provided" },
    { label: "Occupation", value: surveyData.occupation || "Not provided" },
    { label: "Travel time", value: surveyData.travelTime || "Not provided" },
    { label: "Routine", value: surveyData.dailyRoutine || "Not provided" },
    { label: "Main concern", value: surveyData.mainConcern || "Not provided" },
    { label: "Symptom pattern", value: surveyData.symptomFrequency || "Not provided" },
    { label: "Care goal", value: surveyData.careGoal || "Not provided" },
    { label: "Story summary", value: storyAnalysis.patternSummary || "Analyze patient story to unlock this" },
  ];

  const departmentCount = new Set(remoteInsights.map(insight => insight.department).filter(Boolean)).size;
  const avgConfidence = remoteInsights.length
    ? Math.round(remoteInsights.reduce((sum, insight) => sum + insight.confidence, 0) / remoteInsights.length)
    : 0;

  return (
    <AppLayout title="AI Health Analysis" subtitle="Combined analysis from your survey, story, and daily health data">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* AI Disclaimer */}
        <div style={{ padding: "14px 20px", borderRadius: "14px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", gap: "12px" }}>
          <Info size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: "13px", color: "#1D4ED8", lineHeight: 1.5 }}>
            <strong>AI-Generated Informational Content:</strong> These insights are generated from your personal data and should not be considered medical diagnoses. Always consult a qualified healthcare professional for medical advice.
          </p>
        </div>

        {/* Data Sources Banner */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
          {[
            { label: "Survey Responses", icon: CheckCircle, color: "#22C55E", active: dataAvailable.survey },
            { label: "Patient Story", icon: BookOpen, color: "#0F766E", active: dataAvailable.story },
            { label: "Daily Tracker", icon: Activity, color: "#3B82F6", active: dataAvailable.tracker },
            { label: "Medical Reports", icon: Brain, color: "#8B5CF6", active: false },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: "12px", background: s.active ? `${s.color}08` : "var(--background)", border: `1px solid ${s.active ? s.color + "30" : "var(--border)"}`, display: "flex", alignItems: "center", gap: "10px" }}>
              <s.icon size={16} color={s.active ? s.color : "var(--text-muted)"} />
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: s.active ? "var(--text-primary)" : "var(--text-muted)" }}>{s.label}</div>
                <div style={{ fontSize: "10px", color: s.active ? s.color : "var(--text-muted)", fontWeight: 600 }}>{s.active ? "✓ Available" : "Not provided"}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <Sparkles size={18} color="#0F766E" />
            <span className="section-title">Patient Context Used For Insights</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
            {contextGrid.map(item => (
              <div key={item.label} style={{ padding: "14px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--background)", minHeight: "76px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 650, lineHeight: 1.45 }}>{Array.isArray(item.value) ? item.value.join(", ") : String(item.value)}</div>
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="alert alert-warning" style={{ fontSize: "13px" }}>
            <Sparkles size={16} /> Generating personalized insights from your health data...
          </div>
        )}
        {error && (
          <div className="alert alert-warning" style={{ fontSize: "13px" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {remoteInsights.length > 0 && (
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Sparkles size={18} color="#0F766E" />
                <span className="section-title">Personalized AI Insights</span>
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F766E" }}>{remoteInsights.length} personalized insights</div>
            </div>
            <div style={{ display: "grid", gap: "16px" }}>
              {remoteInsights.map((insight, i) => (
                <div key={i} className="card" style={{ padding: "18px", borderLeft: "4px solid #0F766E" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{insight.title}</h3>
                    <div className="badge badge-success" style={{ fontSize: "11px" }}>{insight.confidence}%</div>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "14px" }}>{insight.description}</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {insight.evidence.map((fact, j) => (<div key={j} className="badge badge-accent" style={{ fontSize: "10px" }}>{fact}</div>))}
                  </div>
                  {insight.department && <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F766E", marginTop: "10px" }}>Suggested Department: {insight.department}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Insights Generated", value: String(remoteInsights.length), icon: Brain, color: "#0F766E", bg: "rgba(15,118,110,0.08)" },
            { label: "Tracker Logs", value: String(trackerLogs.length), icon: TrendingUp, color: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
            { label: "Avg Confidence", value: avgConfidence ? `${avgConfidence}%` : "N/A", icon: AlertCircle, color: "#22C55E", bg: "rgba(34,197,94,0.08)" },
            { label: "Dept Suggestions", value: String(departmentCount), icon: Stethoscope, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)" },
          ].map((s, i) => (
            <div key={i} className="metric-card" style={{ flexDirection: "row", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>Health Radar</div>
            {trackerLogs.length > 0 || Object.keys(surveyData).length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <Radar dataKey="A" stroke="#0F766E" fill="rgba(15,118,110,0.15)" strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>Complete survey or tracker to build radar.</div>
            )}
          </div>
          <div className="card" style={{ padding: "24px" }}>
            <div className="section-title" style={{ marginBottom: "16px" }}>Tracker Trend</div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                  <Bar dataKey="fatigue" fill="rgba(239,68,68,0.7)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pain" fill="rgba(245,158,11,0.7)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="energy" fill="rgba(34,197,94,0.7)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "13px" }}>No tracker logs found in DB yet.</div>
            )}
          </div>
        </div>

        {/* Tabs + Insight cards */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div className="tab-list">
              {tabs.map((tab, i) => (
                <button key={i} className={`tab-trigger ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>{tab}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredInsights.length === 0 && (
              <div className="card" style={{ padding: "24px", color: "var(--text-muted)", fontSize: "13px" }}>
                No insights in this category yet. Add survey, story, and tracker data to generate more focused analysis.
              </div>
            )}
            {filteredInsights.map((insight, i) => (
              <div key={i} className="card" style={{ padding: "24px", borderLeft: `4px solid ${insight.type === "warning" ? "#F59E0B" : insight.type === "success" ? "#22C55E" : "#3B82F6"}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{insight.title}</h3>
                  <div className={`badge badge-${insight.type === "warning" ? "warning" : insight.type === "success" ? "success" : "accent"}`}>
                    {insight.type === "warning" ? "⚠ Attention" : insight.type === "success" ? "✓ Positive" : "ℹ Info"}
                  </div>
                </div>

                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>{insight.description}</p>

                <div style={{ background: "var(--background)", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>Evidence Used</div>
                  {insight.evidence.map((e, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#0F766E", flexShrink: 0 }} />{e}
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Confidence Score</span>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#22C55E" }}>{insight.confidence}%</span>
                    </div>
                    <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${insight.confidence}%` }} /></div>
                  </div>
                  <div style={{ padding: "8px 14px", background: "rgba(15,118,110,0.06)", border: "1px solid rgba(15,118,110,0.15)", borderRadius: "10px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "2px" }}>Suggested Dept</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#0F766E" }}>🏥 {insight.department || "General Medicine"}</div>
                  </div>
                </div>

                <ExplainableReasoningBox
                  surveyFactors={insight.surveyFactors || []}
                  lifestyleFactors={insight.lifestyleFactors || []}
                  storyFactors={insight.storyFactors || []}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA to Integrative Explorer */}
        <div style={{ padding: "28px 32px", borderRadius: "20px", background: "linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #14B8A6 100%)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Sparkles size={20} color="white" />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Step</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Explore Integrative Treatment Options
            </h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, maxWidth: "500px", marginBottom: "20px" }}>
              Based on your symptoms and analysis, discover which healthcare systems (Allopathy, Ayurveda, Homeopathy, Naturopathy, Siddha) may be relevant for you — along with verified practitioner recommendations.
            </p>
            <Link href="/integrative" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", background: "white", color: "#0F766E", fontWeight: 700, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              Explore Integrative Treatments <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="alert alert-warning" style={{ fontSize: "12px" }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          All insights are generated from your personal health data and should not be considered medical diagnoses. Please consult a qualified healthcare professional for medical advice.
        </div>
      </div>
    </AppLayout>
  );
}

"use client";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Brain, Activity, Moon, Droplets, Smile, Zap, FileText, Calendar, ChevronRight, AlertCircle, Sparkles, Play, Star, Users, Leaf, Check, ArrowRight, ClipboardList } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";

const symptomData = [
  { day: "Mon", fatigue: 7, pain: 4, mood: 6 }, { day: "Tue", fatigue: 6, pain: 3, mood: 7 },
  { day: "Wed", fatigue: 8, pain: 5, mood: 5 }, { day: "Thu", fatigue: 5, pain: 3, mood: 8 },
  { day: "Fri", fatigue: 4, pain: 2, mood: 8 }, { day: "Sat", fatigue: 3, pain: 2, mood: 9 }, { day: "Sun", fatigue: 5, pain: 3, mood: 7 },
];

const sleepData = [
  { day: "Mon", hours: 5.5 }, { day: "Tue", hours: 6.2 }, { day: "Wed", hours: 4.8 },
  { day: "Thu", hours: 7.1 }, { day: "Fri", hours: 6.8 }, { day: "Sat", hours: 8.2 }, { day: "Sun", hours: 7.4 },
];

const metrics = [
  { label: "Stress Level", value: "Moderate", icon: Zap, color: "#F59E0B", bg: "rgba(245,158,11,0.08)", trend: "-2", up: false },
  { label: "Sleep Quality", value: "6.8", max: "hrs", icon: Moon, color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", trend: "+0.5", up: true },
  { label: "Water Intake", value: "6", max: "/8 cups", icon: Droplets, color: "#3B82F6", bg: "rgba(59,130,246,0.08)", trend: "On track", up: true },
  { label: "Mood", value: "Good", icon: Smile, color: "#22C55E", bg: "rgba(34,197,94,0.08)", trend: "+1", up: true },
  { label: "Activity", value: "4,245", max: " steps", icon: Activity, color: "#EF4444", bg: "rgba(239,68,68,0.08)", trend: "-800", up: false },
];

const recentReports = [
  { name: "Blood Test Report", date: "May 20, 2025", status: "Analyzed" },
  { name: "MRI Brain Scan", date: "May 15, 2025", status: "Uploaded" },
  { name: "X-Ray Chest", date: "May 10, 2025", status: "Analyzed" },
];

const insights = [
  { text: "Your sleep quality has improved by 12% this week.", type: "success" },
  { text: "Stress levels are higher on weekdays. Consider a routine.", type: "warning" },
  { text: "Consider improving hydration — averaging 6/8 cups.", type: "info" },
];

function HealthScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ width: size, height: size, transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="8" />
        <circle cx="50" cy="50" r={radius} fill="none"
          stroke="url(#scoreGrad)" strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)", filter: "drop-shadow(0 0 6px rgba(15,118,110,0.5))" }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F766E" /><stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size === 120 ? "28px" : "20px", fontWeight: 900, color: "#0F766E", letterSpacing: "-0.03em" }}>{animated}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [demoMode, setDemoMode] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [integrativeTopSystems, setIntegrativeTopSystems] = useState<{ name: string; icon: string; confidence: number; color: string }[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<{ system: string; doctor: string; date: string; rating: number }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("demo") === "true" || localStorage.getItem("demoMode") === "true") setDemoMode(true);
      const survey = localStorage.getItem("echocare-survey");
      if (survey) setSurveyCompleted(true);
      const feedback = localStorage.getItem("echocare-feedback-history");
      if (feedback) { try { setFeedbackHistory(JSON.parse(feedback).slice(0, 3)); } catch {} }
      // Mock integrative top systems
      setIntegrativeTopSystems([
        { name: "Ayurveda", icon: "🌿", confidence: 78, color: "#22C55E" },
        { name: "Naturopathy", icon: "🍃", confidence: 74, color: "#0F766E" },
      ]);
    }
  }, []);

  return (
    <AppLayout title="Dashboard" subtitle="One view of your entire health journey">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Date + Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-secondary btn-sm" style={{ gap: "6px" }}>
              <Sparkles size={13} /> Generate Doctor PDF
            </button>
            <Link href="/tracker" className="btn btn-secondary btn-sm">Log Today</Link>
            <Link href="/reports" className="btn btn-primary btn-sm">Upload Report</Link>
          </div>
        </div>

        {/* Demo banner */}
        {demoMode && (
          <div style={{ padding: "12px 20px", borderRadius: "12px", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", gap: "12px" }}>
            <Play size={14} color="#3B82F6" fill="#3B82F6" />
            <span style={{ fontSize: "13px", color: "#1D4ED8", fontWeight: 600 }}>Demo Mode — Showing sample patient data</span>
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto", color: "#3B82F6", fontSize: "12px" }} onClick={() => setDemoMode(false)}>Exit Demo</button>
          </div>
        )}

        {/* Survey prompt banner */}
        {!surveyCompleted && (
          <div style={{ padding: "18px 22px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(15,118,110,0.08), rgba(20,184,166,0.04))", border: "1px solid rgba(15,118,110,0.25)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(15,118,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ClipboardList size={22} color="#0F766E" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>Complete Your Health Profile</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Take the initial survey to unlock personalized AI insights and integrative treatment recommendations.</div>
            </div>
            <Link href="/survey" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>Start Survey <ArrowRight size={13} /></Link>
          </div>
        )}

        {/* Health score + metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "20px", alignItems: "stretch" }}>
          <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", minWidth: "180px", background: "linear-gradient(135deg, rgba(15,118,110,0.04), rgba(20,184,166,0.02))" }}>
            <HealthScoreRing score={72} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>Health Score</div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center", marginTop: "4px" }}>
                <TrendingUp size={12} color="#16A34A" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A" }}>+5 pts this week</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px" }}>
            {metrics.map((m, i) => (
              <div key={i} className="metric-card">
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: m.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <m.icon size={17} color={m.color} />
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                  {m.value}<span style={{ fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{m.max ?? ""}</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{m.label}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", fontWeight: 700, color: m.up ? "#16A34A" : "#DC2626" }}>
                  {m.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{m.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <div className="section-title">Symptom Trend</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>This week</div>
              </div>
              <div style={{ display: "flex", gap: "14px" }}>
                {[{ label: "Fatigue", color: "#0F766E" }, { label: "Pain", color: "#EF4444" }, { label: "Mood", color: "#3B82F6" }].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: l.color }} />
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={symptomData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="fatigue" stroke="#0F766E" strokeWidth={2.5} dot={{ fill: "#0F766E", r: 3 }} />
                <Line type="monotone" dataKey="pain" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: "#EF4444", r: 3 }} />
                <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2.5} dot={{ fill: "#3B82F6", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div className="section-title">Sleep Quality</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Weekly avg: 6.8 hrs</div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="hours" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#sleepGrad)" dot={{ fill: "#8B5CF6", r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Main widgets row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
          {/* AI Insights */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={16} color="#0F766E" />
                <span className="section-title">AI Insights</span>
              </div>
              <Link href="/insights" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 600 }}>View All</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {insights.map((insight, i) => (
                <div key={i} className={`alert alert-${insight.type}`} style={{ padding: "10px 12px", fontSize: "12px" }}>
                  <AlertCircle size={12} style={{ flexShrink: 0 }} />{insight.text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "14px", padding: "12px 14px", background: "rgba(15,118,110,0.06)", borderRadius: "10px", border: "1px solid rgba(15,118,110,0.12)" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#0F766E", marginBottom: "3px" }}>AI Dept Suggestion</div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>🏥 Rheumatology</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>87% confidence · Based on symptom pattern</div>
            </div>
          </div>

          {/* Reports */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={16} color="#3B82F6" />
                <span className="section-title">Recent Reports</span>
              </div>
              <Link href="/reports" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 600 }}>View All</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recentReports.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--border)" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={13} color="#3B82F6" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.date}</div>
                  </div>
                  <div className={`badge badge-${r.status === "Analyzed" ? "success" : "primary"}`} style={{ fontSize: "10px" }}>{r.status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions + Streak */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Calendar size={15} color="#F59E0B" />
                <span className="section-title">Quick Actions</span>
              </div>
              {[
                { label: "Analyze my story", href: "/story", icon: "📝" },
                { label: "Log today's health", href: "/tracker", icon: "📋" },
                { label: "Integrative Explorer", href: "/integrative", icon: "🌿" },
                { label: "Leave feedback", href: "/feedback", icon: "⭐" },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: "16px" }}>{a.icon}</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", flex: 1 }}>{a.label}</span>
                    <ChevronRight size={13} color="var(--text-muted)" />
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, #0F766E, #14B8A6)", borderRadius: "16px", padding: "18px", color: "white", textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 900 }}>🔥 14</div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>Day Streak!</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Keep it up</div>
            </div>
          </div>
        </div>

        {/* Integrative Explorer Widget */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Leaf size={16} color="#22C55E" />
              <span className="section-title">Integrative Treatment Explorer</span>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "100px", background: "rgba(15,118,110,0.1)", color: "#0F766E" }}>NEW</span>
            </div>
            <Link href="/integrative" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 600 }}>Explore All →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {integrativeTopSystems.map((sys, i) => (
              <Link key={i} href="/integrative" style={{ textDecoration: "none" }}>
                <div style={{ padding: "16px", borderRadius: "12px", background: `${sys.color}08`, border: `1px solid ${sys.color}25`, display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"}>
                  <div style={{ fontSize: "28px" }}>{sys.icon}</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{sys.name}</div>
                    <div style={{ fontSize: "12px", color: sys.color, fontWeight: 600 }}>{sys.confidence}% profile match</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <div style={{ width: "36px", height: "36px" }}>
                      <svg viewBox="0 0 36 36" width="36" height="36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke={`${sys.color}20`} strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke={sys.color} strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 14}`}
                          strokeDashoffset={`${2 * Math.PI * 14 * (1 - sys.confidence / 100)}`}
                          strokeLinecap="round" transform="rotate(-90 18 18)" />
                        <text x="18" y="22" textAnchor="middle" fontSize="9" fontWeight="800" fill={sys.color}>{sys.confidence}%</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "10px", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", fontSize: "12px", color: "#1D4ED8" }}>
            ℹ️ AI suggestions are informational only. Discuss with qualified healthcare professionals before making any treatment decisions.
          </div>
        </div>

        {/* Survey Summary + Feedback History */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Survey summary */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={16} color="#8B5CF6" />
                <span className="section-title">Survey Summary</span>
              </div>
              <Link href="/survey" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 600 }}>Update</Link>
            </div>
            {surveyCompleted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[{ label: "Profile", status: "Complete", color: "#22C55E" }, { label: "Symptoms", status: "5 logged", color: "#0F766E" }, { label: "Lifestyle", status: "Assessed", color: "#3B82F6" }, { label: "Mental Wellbeing", status: "Assessed", color: "#8B5CF6" }, { label: "Medical History", status: "Complete", color: "#F59E0B" }].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: item.color, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={11} /> {item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>📋</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>Survey not yet completed</div>
                <Link href="/survey" className="btn btn-primary btn-sm">Start Survey</Link>
              </div>
            )}
          </div>

          {/* Feedback history */}
          <div className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Star size={16} color="#F59E0B" />
                <span className="section-title">Feedback History</span>
              </div>
              <Link href="/feedback" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 600 }}>Add Feedback</Link>
            </div>
            {feedbackHistory.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {feedbackHistory.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "18px" }}>{f.system === "Ayurveda" ? "🌿" : f.system === "Allopathy" ? "🏥" : f.system === "Naturopathy" ? "🍃" : f.system === "Homeopathy" ? "💊" : "⚗️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{f.system} · {f.doctor || "Anonymous"}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{f.date}</div>
                    </div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={11} color="#F59E0B" fill={j < f.rating ? "#F59E0B" : "none"} />)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>⭐</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>No feedback yet</div>
                <Link href="/feedback" className="btn btn-secondary btn-sm">Share Experience</Link>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="alert alert-warning" style={{ fontSize: "12px" }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          All AI-generated insights are based solely on your provided information and are not medical diagnoses. Always consult a qualified healthcare professional.
        </div>
      </div>
    </AppLayout>
  );
}

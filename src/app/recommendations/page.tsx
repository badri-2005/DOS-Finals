"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { Stethoscope, Salad, Dumbbell, Moon, Brain, Leaf, ArrowRight, Check } from "lucide-react";

const tabs = [
  { label: "Lifestyle", icon: Leaf },
  { label: "Diet", icon: Salad },
  { label: "Exercise", icon: Dumbbell },
  { label: "Sleep", icon: Moon },
  { label: "Stress", icon: Brain },
  { label: "Doctor & Dept.", icon: Stethoscope },
];

const lifestyle = [
  { title: "Drink 8 cups of water in the morning", priority: "High", tag: "Hydration", done: false },
  { title: "Include fiber in your diet 10 minutes daily", priority: "Medium", tag: "Nutrition", done: true },
  { title: "Stretch for 10 minutes before bed", priority: "Medium", tag: "Flexibility", done: false },
];

const diet = [
  { title: "Add anti-inflammatory foods: turmeric, ginger, omega-3", priority: "High", tag: "Nutrition", done: false },
  { title: "Reduce processed sugar and refined carbs", priority: "High", tag: "Diet", done: false },
  { title: "Eat a protein-rich breakfast within 1 hour of waking", priority: "Medium", tag: "Energy", done: true },
  { title: "Include leafy greens at least once a day", priority: "Low", tag: "Vitamins", done: false },
];

const exercise = [
  { title: "Start with 15-min gentle walking daily", priority: "High", tag: "Cardio", done: false },
  { title: "Try yoga or stretching 3x/week for joint mobility", priority: "High", tag: "Flexibility", done: false },
  { title: "Avoid high-impact exercise until symptom cause is identified", priority: "High", tag: "Safety", done: true },
];

const sleep = [
  { title: "Maintain a consistent sleep schedule (10 PM – 6 AM)", priority: "High", tag: "Sleep Hygiene", done: false },
  { title: "Avoid screens 1 hour before bed", priority: "High", tag: "Sleep Hygiene", done: false },
  { title: "Use magnesium glycinate supplement (consult doctor first)", priority: "Medium", tag: "Supplement", done: false },
  { title: "Keep bedroom cool (18–20°C) and dark", priority: "Low", tag: "Environment", done: true },
];

const stress = [
  { title: "Practice 4-7-8 breathing for 5 minutes daily", priority: "High", tag: "Breathing", done: false },
  { title: "Set clear work-home boundaries", priority: "High", tag: "Boundaries", done: false },
  { title: "Journal before bed for 10 minutes", priority: "Medium", tag: "Mental Health", done: true },
];

const doctorRecs = [
  {
    dept: "Rheumatology",
    reason: "Persistent joint pain and fatigue without a clear diagnosis",
    confidence: 87,
    urgency: "Medium",
    icon: "🦴"
  },
  {
    dept: "Endocrinology",
    reason: "Fatigue, low Vitamin D, and borderline ferritin may indicate hormonal/metabolic factors",
    confidence: 72,
    urgency: "Low",
    icon: "⚗️"
  },
  {
    dept: "Sleep Medicine",
    reason: "Chronic poor sleep quality disrupting recovery and mood",
    confidence: 85,
    urgency: "Medium",
    icon: "🌙"
  },
];

const allRecs = [lifestyle, diet, exercise, sleep, stress, []];

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setDoneMap(prev => ({ ...prev, [key]: !prev[key] }));

  const recs = allRecs[activeTab];

  return (
    <AppLayout title="Recommendations" subtitle="Personalized wellness recommendations based on your health data">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 18px", borderRadius: "100px",
              border: `1.5px solid ${activeTab === i ? "#0F766E" : "var(--border)"}`,
              background: activeTab === i ? "rgba(15,118,110,0.08)" : "var(--surface)",
              color: activeTab === i ? "#0F766E" : "var(--text-secondary)",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              transition: "all 0.2s", fontFamily: "'Inter', sans-serif"
            }}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recommendation cards */}
        {activeTab < 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recs.map((rec, i) => {
              const key = `${activeTab}-${i}`;
              const isDone = doneMap[key] || rec.done;
              return (
                <div key={i} className="card" style={{
                  padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px",
                  opacity: isDone ? 0.6 : 1, transition: "opacity 0.2s"
                }}>
                  <button onClick={() => toggle(key)} style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    border: `2px solid ${isDone ? "#22C55E" : "var(--border)"}`,
                    background: isDone ? "#22C55E" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {isDone && <Check size={14} color="white" />}
                  </button>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", textDecoration: isDone ? "line-through" : "none", marginBottom: "6px" }}>
                      {rec.title}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <div className={`badge badge-${rec.tag}`} style={{
                        background: "var(--border-light)", color: "var(--text-muted)",
                        fontSize: "10px"
                      }}>{rec.tag}</div>
                      <div className={`badge badge-${rec.priority === "High" ? "danger" : rec.priority === "Medium" ? "warning" : "muted"}`} style={{ fontSize: "10px" }}>
                        {rec.priority} Priority
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-ghost btn-sm" style={{ color: "#0F766E", fontWeight: 600 }}>
                    Details <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Doctor dept tab */}
        {activeTab === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px 20px", borderRadius: "14px", background: "rgba(15,118,110,0.06)", border: "1px solid rgba(15,118,110,0.2)" }}>
              <p style={{ fontSize: "13px", color: "#0F766E", lineHeight: 1.6 }}>
                🤖 Based on your patient story, daily health logs, symptoms, and uploaded reports, the following medical departments may be relevant to your situation. These are AI suggestions — always consult your GP first.
              </p>
            </div>

            {doctorRecs.map((dr, i) => (
              <div key={i} className="card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "rgba(15,118,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                      {dr.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{dr.dept}</h3>
                      <div className={`badge badge-${dr.urgency === "Medium" ? "warning" : "muted"}`} style={{ marginTop: "4px", fontSize: "10px" }}>
                        {dr.urgency} Urgency
                      </div>
                    </div>
                  </div>
                  <div className="badge badge-success">AI Suggestion</div>
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "16px" }}>{dr.reason}</p>

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>Confidence Score</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#22C55E" }}>{dr.confidence}%</span>
                  </div>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${dr.confidence}%` }} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="btn btn-primary btn-sm">Find a {dr.dept} Specialist</button>
                  <button className="btn btn-secondary btn-sm">Book Consultation</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

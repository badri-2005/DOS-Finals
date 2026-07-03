"use client";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Calendar, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

const moods = [
  { emoji: "😊", label: "Great", val: "great" },
  { emoji: "🙂", label: "Good", val: "good" },
  { emoji: "😐", label: "Okay", val: "okay" },
  { emoji: "😔", label: "Low", val: "low" },
  { emoji: "😞", label: "Bad", val: "bad" },
];

const symptoms = ["Fatigue", "Joint Pain", "Headache", "Brain Fog", "Nausea", "Dizziness", "Chest Pain", "Shortness of Breath", "Muscle Weakness", "Digestive Issues"];

export default function TrackerPage() {
  const [selectedMood, setSelectedMood] = useState("good");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(5);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [pain, setPain] = useState(3);
  const [activeView, setActiveView] = useState<"today" | "week" | "month">("today");
  const [saved, setSaved] = useState(false);
  const [savedLog, setSavedLog] = useState<Record<string, unknown> | null>(null);
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tracker")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
          const todayStr = new Date().toISOString().split("T")[0];
          const todayLog = data.find((l: any) => l.date === todayStr);
          if (todayLog) {
            setSavedLog(todayLog);
            setSelectedMood(todayLog.mood);
            setSleep(todayLog.sleep_hours);
            setWater(todayLog.water_intake);
            setPain(todayLog.joint_pain);
            setEnergy(10 - todayLog.fatigue);
          }
        }
      })
      .catch(err => console.error("Failed to load logs:", err));
  }, []);

  const saveTrackerLog = async () => {
    const payload = {
      mood: selectedMood,
      symptoms: selectedSymptoms,
      sleep,
      water,
      stress,
      energy,
      pain,
      date: new Date().toISOString(),
    };
    
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setSavedLog(data.log);
        
        // Reload history
        const histRes = await fetch("/api/tracker");
        if (histRes.ok) {
          const histData = await histRes.json();
          setHistory(histData);
        }
      }
    } catch (err) {
      console.error("Failed to save check-in:", err);
    }
    
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => saveTrackerLog();

  const handleGenerateInsights = () => {
    saveTrackerLog();
    router.push("/insights");
  };

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const SliderInput = ({ label, value, onChange, max, color, suffix }: { label: string; value: number; onChange: (v: number) => void; max: number; color: string; suffix?: string }) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</label>
        <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}{suffix}</span>
      </div>
      <input
        type="range" min={0} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color, height: "4px", cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>0</span>
        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{max}</span>
      </div>
    </div>
  );

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData = [
    { mood: "😊", sleep: 7.1, stress: 4, symptoms: 2 },
    { mood: "🙂", sleep: 6.5, stress: 5, symptoms: 3 },
    { mood: "😐", sleep: 4.8, stress: 7, symptoms: 4 },
    { mood: "🙂", sleep: 7.4, stress: 3, symptoms: 1 },
    { mood: "😊", sleep: 6.8, stress: 4, symptoms: 2 },
    { mood: "😊", sleep: 8.2, stress: 2, symptoms: 1 },
    { mood: "🙂", sleep: 7.0, stress: 3, symptoms: 2 },
  ];

  return (
    <AppLayout title="Daily Health Tracker" subtitle="Track your health and lifestyle every day">
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Main form */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Date + View toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px" }}><ChevronLeft size={16} /></button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={15} color="#0F766E" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px" }}><ChevronRight size={16} /></button>
            </div>
            <div className="tab-list">
              {(["today", "week", "month"] as const).map(v => (
                <button key={v} className={`tab-trigger ${activeView === v ? "active" : ""}`} onClick={() => setActiveView(v)} style={{ textTransform: "capitalize" }}>{v}</button>
              ))}
            </div>
          </div>

          {activeView === "today" && (
            <>
              {/* Mood */}
              <div className="card" style={{ padding: "24px" }}>
                <div className="section-title" style={{ marginBottom: "16px" }}>😊 How are you feeling today?</div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {moods.map(m => (
                    <button key={m.val} className={`mood-btn ${selectedMood === m.val ? "selected" : ""}`} onClick={() => setSelectedMood(m.val)} style={{ flex: 1 }}>
                      <span className="emoji">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vitals & Sliders */}
              <div className="card" style={{ padding: "24px" }}>
                <div className="section-title" style={{ marginBottom: "20px" }}>📊 Daily Vitals</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
                  <SliderInput label="Sleep Duration" value={sleep} onChange={setSleep} max={12} color="#8B5CF6" suffix=" hrs" />
                  <SliderInput label="Water Intake" value={water} onChange={setWater} max={12} color="#3B82F6" suffix=" cups" />
                  <SliderInput label="Stress Level" value={stress} onChange={setStress} max={10} color="#F59E0B" />
                  <SliderInput label="Energy Level" value={energy} onChange={setEnergy} max={10} color="#22C55E" />
                  <SliderInput label="Pain Level" value={pain} onChange={setPain} max={10} color="#EF4444" />
                </div>
              </div>

              {/* Symptoms */}
              <div className="card" style={{ padding: "24px" }}>
                <div className="section-title" style={{ marginBottom: "16px" }}>🩺 Today&apos;s Symptoms</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                  {symptoms.map(s => (
                    <button key={s} onClick={() => toggleSymptom(s)} style={{
                      padding: "7px 14px", borderRadius: "100px",
                      border: `1.5px solid ${selectedSymptoms.includes(s) ? "#0F766E" : "var(--border)"}`,
                      background: selectedSymptoms.includes(s) ? "rgba(15,118,110,0.08)" : "var(--surface)",
                      color: selectedSymptoms.includes(s) ? "#0F766E" : "var(--text-secondary)",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'Inter', sans-serif"
                    }}>{s}</button>
                  ))}
                </div>
                {selectedSymptoms.length > 0 && (
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* Diet & Medication & Notes */}
              <div className="card" style={{ padding: "24px" }}>
                <div className="section-title" style={{ marginBottom: "16px" }}>📋 Additional Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Diet today</label>
                    <select className="form-input">
                      <option>Select diet quality</option>
                      <option>Excellent — Healthy balanced meals</option>
                      <option>Good — Mostly healthy</option>
                      <option>Average — Some healthy choices</option>
                      <option>Poor — Mostly processed food</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Physical activity</label>
                    <select className="form-input">
                      <option>Select activity level</option>
                      <option>None</option>
                      <option>Light walk</option>
                      <option>Moderate exercise (30 min)</option>
                      <option>Intense workout</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Medication taken?</label>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {["Yes, all taken", "Missed dose", "No medication", "N/A"].map(opt => (
                        <div key={opt} style={{ padding: "8px 14px", borderRadius: "8px", border: "1.5px solid var(--border)", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", transition: "all 0.2s" }}
                          onClick={e => {
                            document.querySelectorAll("[data-med]").forEach(el => {
                              (el as HTMLElement).style.borderColor = "var(--border)";
                              (el as HTMLElement).style.color = "var(--text-secondary)";
                            });
                            e.currentTarget.style.borderColor = "#0F766E";
                            e.currentTarget.style.color = "#0F766E";
                          }}
                          data-med={opt}
                        >{opt}</div>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="form-input" placeholder="Any additional notes about today..." style={{ minHeight: "80px" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: "12px 32px", fontSize: "15px" }}
                  onClick={handleSave}
                >
                  <Save size={16} />{saved ? "✓ Saved!" : "Save Today's Log"}
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: "12px 24px", fontSize: "15px" }}
                  onClick={handleGenerateInsights}
                >
                  <Sparkles size={16} /> Generate AI Insights
                </button>
              </div>
            </>
          )}

          {activeView === "week" && (
            <div className="card" style={{ padding: "24px" }}>
              <div className="section-title" style={{ marginBottom: "20px" }}>Weekly Overview</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px" }}>
                {weekDays.map((day, i) => (
                  <div key={day} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "8px" }}>{day}</div>
                    <div style={{ padding: "12px 8px", borderRadius: "12px", background: i === 6 ? "rgba(15,118,110,0.08)" : "var(--background)", border: `1px solid ${i === 6 ? "#0F766E" : "var(--border)"}` }}>
                      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{weekData[i].mood}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{weekData[i].sleep}h</div>
                      <div style={{ fontSize: "11px", color: weekData[i].stress > 5 ? "#F59E0B" : "#22C55E", fontWeight: 600 }}>S:{weekData[i].stress}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === "month" && (
            <div className="card" style={{ padding: "24px" }}>
              <div className="section-title" style={{ marginBottom: "20px" }}>Monthly Calendar — July 2025</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", paddingBottom: "8px" }}>{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <div key={day} style={{
                    aspectRatio: "1 / 1", padding: "8px 4px", borderRadius: "8px", textAlign: "center",
                    background: day <= 2 ? "rgba(15,118,110,0.1)" : "transparent",
                    border: `1px solid ${day <= 2 ? "#0F766E" : "var(--border)"}`,
                    cursor: "pointer"
                  }}>
                    <div style={{ fontSize: "12px", fontWeight: day <= 2 ? 700 : 400, color: day <= 2 ? "#0F766E" : "var(--text-secondary)" }}>{day}</div>
                    {day <= 2 && <div style={{ fontSize: "14px" }}>😊</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: "280px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Today's summary */}
          <div className="card" style={{ padding: "20px" }}>
            <div className="section-title" style={{ marginBottom: "14px" }}>Today&apos;s Summary</div>
            {[
              { label: "Sleep", value: `${sleep} hrs`, color: "#8B5CF6" },
              { label: "Water", value: `${water}/12 cups`, color: "#3B82F6" },
              { label: "Stress", value: `${stress}/10`, color: "#F59E0B" },
              { label: "Energy", value: `${energy}/10`, color: "#22C55E" },
              { label: "Pain", value: `${pain}/10`, color: "#EF4444" },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{item.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ background: item.color, width: `${(item.label === "Sleep" ? sleep / 12 : item.label === "Water" ? water / 12 : item.label === "Stress" ? stress / 10 : item.label === "Energy" ? energy / 10 : pain / 10) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak */}
          <div style={{ background: "linear-gradient(135deg, #0F766E, #14B8A6)", borderRadius: "16px", padding: "20px", color: "white" }}>
            <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "-0.03em" }}>🔥 14</div>
            <div style={{ fontSize: "14px", fontWeight: 700, marginTop: "4px" }}>Day Tracking Streak!</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>Keep it up — you&apos;re doing great.</div>
          </div>

          <div className="privacy-notice">
            <span>🔒</span>
            <span>Your daily logs are encrypted and stored securely.</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

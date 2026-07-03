"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { Briefcase, Home, Lock, ChevronRight, AlertCircle } from "lucide-react";

export default function StressPage() {
  const [activeSection, setActiveSection] = useState<"workplace" | "family" | "vent">("workplace");
  const [ventText, setVentText] = useState("");
  const [burnoutAnswers, setBurnoutAnswers] = useState<Record<string, string>>({});

  const burnoutQuestions = [
    { q: "Do you feel emotionally drained by your work?", key: "drain" },
    { q: "Do you find it hard to concentrate at work?", key: "focus" },
    { q: "Do you feel cynical or detached from your job?", key: "cynical" },
    { q: "Do you have trouble sleeping due to work stress?", key: "sleep" },
    { q: "Do you feel like your effort isn't recognized?", key: "recognition" },
  ];

  const workplaceBoundaries = [
    "I won't be available after [time] on weekdays.",
    "I need time to review this before responding.",
    "I'd like to discuss this further in our next meeting.",
    "I'm currently at capacity — can we prioritize?",
    "I'll need [X] working days to complete this properly.",
  ];

  const familyExercises = [
    { title: "I-Statement Practice", desc: "Replace 'You always...' with 'I feel... when...' to reduce defensiveness.", example: '"I feel overwhelmed when there\'s no quiet time in the evenings."' },
    { title: "The Pause Method", desc: "Before responding to a heated message or conversation, take a 5-minute pause.", example: "Write your response, wait 5 minutes, then read it before sending." },
    { title: "The 3-Good-Things Exercise", desc: "End each day by naming 3 positive things about family relationships.", example: '"Today, [family member] helped me with something small — I noticed that."' },
  ];

  return (
    <AppLayout title="Stress Support" subtitle="Dedicated modules for workplace and family stress">
      {/* Section tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
        {[
          { id: "workplace", label: "Workplace Stress", icon: Briefcase },
          { id: "family", label: "Family Stress", icon: Home },
          { id: "vent", label: "Private Vent Space", icon: Lock },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id as typeof activeSection)} style={{
            display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px",
            borderRadius: "12px", border: `2px solid ${activeSection === id ? "#0F766E" : "var(--border)"}`,
            background: activeSection === id ? "rgba(15,118,110,0.08)" : "var(--surface)",
            color: activeSection === id ? "#0F766E" : "var(--text-secondary)",
            fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
            fontFamily: "'Inter', sans-serif"
          }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Workplace */}
      {activeSection === "workplace" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Boundary scripts */}
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Boundary-Setting Scripts</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Use these professionally worded phrases to set clear, respectful boundaries at work.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {workplaceBoundaries.map((script, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: "12px", background: "var(--background)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500, fontStyle: "italic" }}>
                    &quot;{script}&quot;
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: "11px", color: "#0F766E" }}>Copy</button>
                </div>
              ))}
            </div>
          </div>

          {/* Before You Respond Prompt */}
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Before You Respond Pause</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              Got a difficult email or message? Paste it here and answer these 3 questions before responding.
            </p>
            <textarea className="form-input" placeholder="Paste the message or describe the situation..." style={{ minHeight: "100px", marginBottom: "16px" }} />
            {[
              "Am I responding from emotion or reason right now?",
              "What do I actually want to achieve with my response?",
              "Is this the right time and place to respond?",
            ].map((q, i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: "10px", border: "1px solid var(--border)", marginBottom: "10px", background: "var(--background)" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>Q{i + 1}: {q}</div>
                <input type="text" className="form-input" placeholder="Your answer..." style={{ padding: "8px 12px", fontSize: "13px" }} />
              </div>
            ))}
            <button className="btn btn-primary btn-sm" style={{ marginTop: "8px" }}>I&apos;m ready to respond thoughtfully</button>
          </div>

          {/* Burnout Check */}
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Burnout Self-Check</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>Answer honestly. Results stay private with you.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {burnoutQuestions.map((bq, i) => (
                <div key={i}>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "10px" }}>{bq.q}</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["Never", "Sometimes", "Often", "Always"].map(opt => (
                      <button key={opt} onClick={() => setBurnoutAnswers(p => ({ ...p, [bq.key]: opt }))} style={{
                        padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                        border: `1.5px solid ${burnoutAnswers[bq.key] === opt ? "#0F766E" : "var(--border)"}`,
                        background: burnoutAnswers[bq.key] === opt ? "rgba(15,118,110,0.08)" : "var(--surface)",
                        color: burnoutAnswers[bq.key] === opt ? "#0F766E" : "var(--text-secondary)",
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "'Inter', sans-serif"
                      }}>{opt}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(burnoutAnswers).length === burnoutQuestions.length && (
              <div style={{ marginTop: "20px", padding: "16px", borderRadius: "12px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertCircle size={16} color="#D97706" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#92400E" }}>Signs of moderate burnout detected</div>
                <div style={{ fontSize: "13px", color: "#B45309", marginTop: "4px", lineHeight: 1.6 }}>
                  Consider reaching out to our consultancy partners or speaking with your GP. You deserve support.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family */}
      {activeSection === "family" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="card" style={{ padding: "28px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>Communication Reframing Exercises</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              These evidence-based techniques help reduce conflict and improve understanding in family relationships.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {familyExercises.map((ex, i) => (
                <div key={i} className="card" style={{ padding: "20px", borderLeft: "4px solid #0F766E" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>{ex.title}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "12px" }}>{ex.desc}</div>
                  <div style={{ padding: "10px 14px", background: "rgba(15,118,110,0.05)", borderRadius: "8px", fontSize: "13px", color: "#0F766E", fontStyle: "italic" }}>
                    💬 Example: {ex.example}
                  </div>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: "12px" }}>
                    Try this exercise <ChevronRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vent */}
      {activeSection === "vent" && (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <Lock size={18} color="#0F766E" />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Private Vent Space</h3>
            </div>
            <div className="privacy-notice" style={{ marginBottom: "20px", marginTop: "12px" }}>
              <Lock size={13} color="#15803D" />
              <span style={{ fontSize: "12px" }}>
                <strong>100% private.</strong> Nothing written here is saved to our servers, shared with anyone, reported to consultants, or analyzed. This space exists only for you.
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.7 }}>
              Sometimes you just need to say what you&apos;re really feeling — without filters, without worrying about what anyone thinks. This is that space.
            </p>
            <textarea
              className="form-input"
              style={{ minHeight: "320px", fontSize: "15px", lineHeight: 1.8 }}
              placeholder="Say anything you need to say..."
              value={ventText}
              onChange={e => setVentText(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Nothing is saved or reported</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setVentText("")}>Clear & Start Over</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

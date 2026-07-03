"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { Lock, Wind, Flame, MessageSquare, ChevronRight } from "lucide-react";

const groundingSteps = [
  { num: "5", sense: "things you can see", icon: "👁️" },
  { num: "4", sense: "things you can touch", icon: "🤚" },
  { num: "3", sense: "things you can hear", icon: "👂" },
  { num: "2", sense: "things you can smell", icon: "👃" },
  { num: "1", sense: "thing you can taste", icon: "👅" },
];

export default function SelfCarePage() {
  const [groundingDone, setGroundingDone] = useState<number[]>([]);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [journalText, setJournalText] = useState("");
  const [activeTab, setActiveTab] = useState<"grounding" | "breathing" | "journaling" | "meditation">("grounding");
  let breathTimer: ReturnType<typeof setTimeout>;

  const toggleGrounding = (i: number) => {
    setGroundingDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const startBreathing = () => {
    setBreathing(true);
    const cycle = () => {
      setBreathPhase("inhale");
      breathTimer = setTimeout(() => {
        setBreathPhase("hold");
        breathTimer = setTimeout(() => {
          setBreathPhase("exhale");
          breathTimer = setTimeout(cycle, 8000);
        }, 7000);
      }, 4000);
    };
    cycle();
  };

  const stopBreathing = () => {
    setBreathing(false);
    clearTimeout(breathTimer);
    setBreathPhase("inhale");
  };

  const breathConfig = {
    inhale: { label: "Breathe In", instruction: "Slowly breathe in through your nose...", scale: 1.3 },
    hold: { label: "Hold", instruction: "Hold your breath gently...", scale: 1.3 },
    exhale: { label: "Breathe Out", instruction: "Slowly exhale through your mouth...", scale: 1.0 },
  };

  const meditationSessions = [
    { title: "Body Scan Relaxation", duration: "10 min", level: "Beginner", emoji: "🧘" },
    { title: "Mindful Breathing", duration: "5 min", level: "Beginner", emoji: "🌬️" },
    { title: "Progressive Muscle Relaxation", duration: "15 min", level: "Intermediate", emoji: "💪" },
    { title: "Sleep Meditation", duration: "20 min", level: "All levels", emoji: "🌙" },
  ];

  return (
    <AppLayout title="Self-Care Tools" subtitle="Take a moment for yourself — completely private">
      {/* Privacy notice - prominent */}
      <div className="privacy-notice" style={{ marginBottom: "24px", padding: "14px 20px" }}>
        <Lock size={16} color="#15803D" />
        <span style={{ fontSize: "13px" }}>
          <strong>Your privacy is protected.</strong> These tools are completely private. No data from this section is logged to any reporting or consultancy system.
        </span>
      </div>

      {/* Tool selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "28px" }}>
        {[
          { id: "grounding", emoji: "🌿", label: "Grounding", desc: "5-4-3-2-1 technique" },
          { id: "breathing", emoji: "🌬️", label: "Breathing", desc: "4-7-8 method" },
          { id: "journaling", emoji: "📓", label: "Journaling", desc: "Private space" },
          { id: "meditation", emoji: "🧘", label: "Meditation", desc: "Guided sessions" },
        ].map(tool => (
          <div key={tool.id} onClick={() => setActiveTab(tool.id as typeof activeTab)} style={{
            padding: "20px", borderRadius: "16px", textAlign: "center", cursor: "pointer",
            border: `2px solid ${activeTab === tool.id ? "#0F766E" : "var(--border)"}`,
            background: activeTab === tool.id ? "rgba(15,118,110,0.06)" : "var(--surface)",
            transition: "all 0.2s"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>{tool.emoji}</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: activeTab === tool.id ? "#0F766E" : "var(--text-primary)" }}>{tool.label}</div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{tool.desc}</div>
          </div>
        ))}
      </div>

      {/* Grounding */}
      {activeTab === "grounding" && (
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "36px" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🌿</div>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>5-4-3-2-1 Grounding</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>A mindfulness technique to bring you back to the present moment. Check each item as you notice it.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {groundingSteps.map((step, i) => (
                <div key={i} className={`grounding-step ${groundingDone.includes(i) ? "done" : ""}`} onClick={() => toggleGrounding(i)}>
                  <div className="grounding-step-num">
                    {groundingDone.includes(i) ? "✓" : step.num}
                  </div>
                  <span style={{ fontSize: "18px" }}>{step.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "14px", color: "var(--text-primary)", fontWeight: 500 }}>
                      Notice <strong>{step.num}</strong> {step.sense}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {groundingDone.length === 5 && (
              <div style={{ marginTop: "20px", padding: "16px", background: "rgba(34,197,94,0.08)", borderRadius: "12px", textAlign: "center", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>🎉</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#15803D" }}>Well done! You&apos;ve completed the grounding exercise.</div>
                <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "4px" }}>Take a moment to notice how you feel.</div>
              </div>
            )}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setGroundingDone([])}>Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing */}
      {activeTab === "breathing" && (
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <div className="card" style={{ padding: "48px 36px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: "8px" }}>4-7-8 Breathing</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "40px" }}>Inhale for 4 seconds, hold for 7, exhale for 8. Reduces anxiety and promotes calm.</p>

            {/* Breathing circle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
              <div style={{
                width: "200px", height: "200px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(15,118,110,0.2) 0%, rgba(15,118,110,0.05) 70%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                position: "relative", border: "2px solid rgba(15,118,110,0.2)",
                transition: "transform 0.5s ease",
                transform: breathing ? `scale(${breathConfig[breathPhase].scale})` : "scale(1)"
              }}>
                <Wind size={32} color="#0F766E" style={{ marginBottom: "8px" }} />
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0F766E" }}>
                  {breathing ? breathConfig[breathPhase].label : "Ready"}
                </div>
              </div>
            </div>

            <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "28px", minHeight: "20px" }}>
              {breathing ? breathConfig[breathPhase].instruction : "Press start to begin the exercise"}
            </div>

            {!breathing ? (
              <button className="btn btn-primary" style={{ padding: "12px 32px" }} onClick={startBreathing}>
                <Wind size={16} /> Start Breathing Exercise
              </button>
            ) : (
              <button className="btn btn-secondary" style={{ padding: "12px 32px" }} onClick={stopBreathing}>
                Stop
              </button>
            )}
          </div>
        </div>
      )}

      {/* Journaling */}
      {activeTab === "journaling" && (
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div className="card" style={{ padding: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <MessageSquare size={20} color="#0F766E" />
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Private Journal</h2>
              <div className="privacy-notice" style={{ marginLeft: "auto", padding: "6px 12px" }}>
                <Lock size={12} color="#15803D" />
                <span style={{ fontSize: "11px" }}>Private — never reported</span>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
              This is your private space to write freely. Nothing you write here is shared, analyzed, or reported anywhere. It&apos;s just for you.
            </p>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {["How am I feeling?", "What's on my mind?", "What am I grateful for?", "What do I need right now?"].map(prompt => (
                <button key={prompt} className="btn btn-secondary btn-sm" style={{ fontSize: "12px" }}
                  onClick={() => setJournalText(prev => prev + (prev ? "\n\n" : "") + prompt + " ")}>
                  {prompt}
                </button>
              ))}
            </div>

            <textarea
              className="form-input"
              style={{ minHeight: "280px", fontSize: "15px", lineHeight: 1.8 }}
              placeholder="Write freely here. This is your private space..."
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{journalText.trim().split(/\s+/).filter(Boolean).length} words</span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-ghost btn-sm" onClick={() => setJournalText("")}>Clear</button>
                <button className="btn btn-secondary btn-sm">Save Privately</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meditation */}
      {activeTab === "meditation" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", maxWidth: "700px", margin: "0 auto" }}>
          {meditationSessions.map((session, i) => (
            <div key={i} className="card card-hover" style={{ padding: "24px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{session.emoji}</div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>{session.title}</h3>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <div className="badge badge-muted" style={{ fontSize: "11px" }}>⏱ {session.duration}</div>
                <div className="badge badge-primary" style={{ fontSize: "11px" }}>{session.level}</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ width: "100%" }}>
                <Flame size={13} /> Start Session <ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom notice */}
      <div style={{ textAlign: "center", marginTop: "32px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "100px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <Lock size={13} color="#15803D" />
          <span style={{ fontSize: "12px", color: "#15803D", fontWeight: 500 }}>These tools are private. No reporting trail. No consultancy trigger.</span>
        </div>
      </div>
    </AppLayout>
  );
}

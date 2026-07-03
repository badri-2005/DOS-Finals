"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, AlertCircle, Phone, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

// Lightweight inline markdown → JSX renderer for Echo responses
function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  const parseBold = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={i} style={{ fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        : p
    );
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // ### Heading
    if (line.startsWith("### ")) {
      elements.push(
        <div key={i} style={{ fontWeight: 700, fontSize: "13px", color: "#0F766E", marginTop: "14px", marginBottom: "4px", letterSpacing: "0.02em" }}>
          {parseBold(line.slice(4))}
        </div>
      );
    // ## Heading
    } else if (line.startsWith("## ")) {
      elements.push(
        <div key={i} style={{ fontWeight: 700, fontSize: "14px", color: "#0F766E", marginTop: "14px", marginBottom: "4px" }}>
          {parseBold(line.slice(3))}
        </div>
      );
    // Numbered list  1. item or 1. **item**: text
    } else if (/^\d+\.\s/.test(line)) {
      const text = line.replace(/^\d+\.\s/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
          <span style={{ color: "#0F766E", fontWeight: 700, flexShrink: 0, minWidth: "18px" }}>{line.match(/^\d+/)![0]}.</span>
          <span>{parseBold(text)}</span>
        </div>
      );
    // Indented bullet   - item
    } else if (line.startsWith("   - ") || line.startsWith("  - ")) {
      const text = line.replace(/^\s*-\s/, "");
      elements.push(
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "2px", paddingLeft: "24px" }}>
          <span style={{ color: "#0F766E", flexShrink: 0 }}>›</span>
          <span style={{ fontSize: "13px" }}>{parseBold(text)}</span>
        </div>
      );
    // Top-level bullet  - item
    } else if (line.startsWith("- ")) {
      const text = line.slice(2);
      elements.push(
        <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "4px", paddingLeft: "4px" }}>
          <span style={{ color: "#0F766E", fontWeight: 700, flexShrink: 0 }}>•</span>
          <span>{parseBold(text)}</span>
        </div>
      );
    // Empty line → small gap
    } else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "6px" }} />);
    // Plain text
    } else {
      elements.push(
        <div key={i} style={{ marginBottom: "2px" }}>{parseBold(line)}</div>
      );
    }
    i++;
  }
  return <div style={{ fontSize: "14px", lineHeight: 1.65 }}>{elements}</div>;
}

interface Message {
  sender: "user" | "echo";
  content: string;
  timestamp: string;
}

const crisisKeywords = [
  "suicide", "self-harm", "hurt myself", "end my life", "want to die",
  "can't go on", "hopeless", "kill myself", "abuse", "beaten", "scared of my",
  "work stress", "family stress", "overwhelmed", "not in good mood", "not feeling good"
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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "echo",
      content: "Hello, I am Echo, your AI health companion - not a doctor. I can help you reflect on your story, lifestyle logs, survey answers, symptom trends, and uploaded reports, then suggest gentle wellness steps and the right type of qualified practitioner to discuss things with. How are you feeling today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const detectCrisis = (text: string) => {
    const cleanText = text.toLowerCase();
    return crisisKeywords.some(keyword => cleanText.includes(keyword));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // Add user message
    const userMessage: Message = {
      sender: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    // Passive Risk Detection Trigger
    if (detectCrisis(userText)) {
      setShowCrisisAlert(true);
    }

    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          context: {
            surveyData: readStoredJson("echocare-survey", {}),
            storyAnalysis: readStoredJson("echocare-story-analysis", {}),
            storyText: typeof window !== "undefined" ? window.localStorage.getItem("echocare-story") || "" : "",
            trackerLog: readStoredJson("echocare-tracker-log", {}),
            reports: readStoredJson("echocare-diagnostic-reports", []),
            requestedMarkers: readStoredJson("echocare-requested-markers", []),
          },
        }),
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, {
        sender: "echo",
        content: data.message || "I am here to support you. Tell me more.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch {
      setMessages(prev => [...prev, {
        sender: "echo",
        content: "I'm having a slight connection issue, but I am still listening. How are you holding up?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="AI Companion" subtitle="A safe, supportive space to talk about your health">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch" style={{ height: "calc(100vh - 180px)" }}>
        
        {/* Chat area */}
        <div className="card lg:col-span-3" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", padding: "0" }}>
          {/* Header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(15,118,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={16} color="#0F766E" />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Chat with Echo</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E" }} />
                  Online Companion <span style={{ opacity: 0.6, fontSize: "10px" }}>(healthcompanion)</span>
                </div>
              </div>
            </div>
            <div className="badge badge-primary" style={{ fontSize: "11px" }}>Secure & Private</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ display: "flex", gap: "10px", maxWidth: "70%", flexDirection: m.sender === "user" ? "row-reverse" : "row" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: m.sender === "user" ? "#0F766E" : "rgba(15,118,110,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    {m.sender === "user" ? <User size={13} color="white" /> : <Sparkles size={13} color="#0F766E" />}
                  </div>
                  <div>
                    <div style={{
                      padding: "12px 16px", borderRadius: "16px",
                      background: m.sender === "user" ? "linear-gradient(135deg, #0F766E, #0D9488)" : "var(--background)",
                      color: m.sender === "user" ? "white" : "var(--text-primary)",
                      fontSize: "14px", lineHeight: 1.6,
                      boxShadow: m.sender === "user" ? "0 4px 12px rgba(15,118,110,0.15)" : "0 2px 8px rgba(0,0,0,0.03)",
                      border: m.sender === "user" ? "none" : "1px solid var(--border)",
                      maxWidth: m.sender === "echo" ? "640px" : undefined
                    }}>
                      {m.sender === "echo"
                        ? <MarkdownMessage content={m.content} />
                        : m.content
                      }
                    </div>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px", display: "block", textAlign: m.sender === "user" ? "right" : "left" }}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ display: "flex", gap: "10px", maxWidth: "70%" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(15,118,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={13} color="#0F766E" />
                  </div>
                  <div style={{ padding: "12px 16px", borderRadius: "16px", background: "var(--background)", border: "1px solid var(--border)", display: "flex", gap: "4px", alignItems: "center" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F766E", animation: "bounce 1.4s infinite ease-in-out" }} />
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F766E", animation: "bounce 1.4s infinite ease-in-out 0.2s" }} />
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F766E", animation: "bounce 1.4s infinite ease-in-out 0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Crisis Alert Modal Inline */}
          {showCrisisAlert && (
            <div style={{ padding: "16px 24px", background: "rgba(239,68,68,0.06)", borderTop: "1px solid rgba(239,68,68,0.15)", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", gap: "14px", alignItems: "center" }}>
              <ShieldAlert size={24} color="#EF4444" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#991B1B" }}>We are here to support you.</div>
                <div style={{ fontSize: "12px", color: "#B91C1C", marginTop: "2px" }}>
                  It sounds like you may be going through an extremely difficult time. If you are in distress, please connect with a professional counselor or contact crisis support.
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <Link href="/consultancy" className="btn btn-sm" style={{ background: "#EF4444", color: "white" }}>
                  Get Counselor Help
                </Link>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCrisisAlert(false)}>Dismiss</button>
              </div>
            </div>
          )}

          {/* Input form */}
          <form onSubmit={handleSend} style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: "10px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Talk to Echo about how you feel..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1, borderRadius: "12px", fontSize: "14px" }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ borderRadius: "12px", width: "42px", height: "42px", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-1" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quick Info */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>About your Companion</h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "12px" }}>
              Echo is designed to validate your experience, listen carefully to your narrative, and track daily patterns.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "100% confidential",
                "Non-diagnostic",
                "Validation-first approach"
              ].map(text => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#0F766E", fontWeight: 600 }}>
                  <Sparkles size={11} /> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Quick hotlines */}
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Phone size={14} color="#EF4444" />
              <h3 style={{ fontSize: "13px", fontWeight: 700 }}>24/7 Helpline Links</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                iCall Helpline:<br />
                <strong>9152987821</strong>
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                Vandrevala Helpline:<br />
                <strong>1860-2662-345</strong>
              </div>
              <Link href="/consultancy" className="btn btn-secondary btn-sm" style={{ width: "100%", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
                View All Partners <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Warning */}
          <div className="alert alert-warning" style={{ fontSize: "11px" }}>
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            Echo is not a doctor. Chat outputs should not be used as medical diagnoses.
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </AppLayout>
  );
}

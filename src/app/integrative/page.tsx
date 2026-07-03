"use client";
import AppLayout from "@/components/AppLayout";
import { useEffect, useState, useMemo } from "react";
import { 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Star, 
  Globe, 
  Wifi, 
  Calendar, 
  Users, 
  AlertTriangle, 
  Check, 
  ArrowRight, 
  BookOpen, 
  Shield, 
  Zap,
  Phone,
  Video,
  X,
  Clock,
  User,
  ShieldCheck
} from "lucide-react";
import type { IntegrativeSuggestion, DoctorRecommendation } from "@/lib/gemini";
import { getMockDoctors } from "@/lib/gemini";
import Link from "next/link";

const systemColors: Record<string, { color: string; bg: string; border: string }> = {
  Allopathy:   { color: "#3B82F6", bg: "rgba(59,130,246,0.08)",   border: "rgba(59,130,246,0.2)" },
  Ayurveda:    { color: "#22C55E", bg: "rgba(34,197,94,0.08)",    border: "rgba(34,197,94,0.2)" },
  Siddha:      { color: "#F59E0B", bg: "rgba(245,158,11,0.08)",   border: "rgba(245,158,11,0.2)" },
  Homeopathy:  { color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.2)" },
  Naturopathy: { color: "#0F766E", bg: "rgba(15,118,110,0.08)",   border: "rgba(15,118,110,0.2)" },
};

const evidenceBadgeColors: Record<string, string> = {
  Established: "#22C55E", Moderate: "#3B82F6", Limited: "#F59E0B", Emerging: "#8B5CF6",
};

function EvidenceBadge({ level }: { level: string }) {
  const color = evidenceBadgeColors[level] || "#94A3B8";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "100px", background: `${color}15`, border: `1px solid ${color}30`, fontSize: "11px", fontWeight: 700, color }}>
      <Shield size={9} /> {level} Evidence
    </div>
  );
}

type PersonalizedDoctor = DoctorRecommendation & { matchReason: string };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function personalizeDoctors(system: IntegrativeSuggestion, storyAnalysis?: { suggestedDepartments?: { dept: string }[] }): PersonalizedDoctor[] {
  const departments = Array.isArray(storyAnalysis?.suggestedDepartments)
    ? storyAnalysis.suggestedDepartments.map(item => String(item.dept ?? "").toLowerCase())
    : [];
  const symptoms = system.aiReasoning.symptoms.join(" ").toLowerCase();
  const doctors = getMockDoctors(system.system).map(doc => ({ ...doc, matchReason: "" }));

  return doctors
    .map(doc => {
      let score = doc.rating * 10 + Math.min(20, doc.experience);
      const spec = doc.specialization.toLowerCase();
      if (departments.some(dept => spec.includes(dept) || dept.includes(spec.split(" ")[0]))) score += 18;
      if (/joint|pain|stiff|rheumat/.test(symptoms) && /rheumat|joint|pain|chronic|varmam|herbal/.test(spec)) score += 14;
      if (/fatigue|energy|thyroid|metabolic/.test(symptoms) && /internal|endocrin|metabolism|nutrition|lifestyle/.test(spec)) score += 14;
      if (/stress|anxiety|mood|sleep|brain/.test(symptoms) && /mental|constitutional|lifestyle|rejuvenation|nutrition/.test(spec)) score += 10;
      return {
        ...doc,
        matchScore: score,
        matchReason: `Suggested for ${system.aiReasoning.symptoms.slice(0, 2).join(", ") || system.system.toLowerCase()} support through ${doc.specialization}.`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map(({ matchScore: _matchScore, ...doc }) => doc);
}

function outcomeFromSuggestion(system: IntegrativeSuggestion) {
  const focus = system.typicalFocus[0] || "matched care";
  const confidence = Math.max(42, Math.min(88, system.confidence - 8));
  return `${confidence}% profile alignment for ${focus.toLowerCase()} discussion`;
}

export default function CombinedIntegrativeCarePage() {
  const [suggestions, setSuggestions] = useState<IntegrativeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSystemIdx, setSelectedSystemIdx] = useState(0);

  // Active plan for billing checks
  const [activePlan, setActivePlan] = useState("Free");

  // Booking modal states
  const [selectedDoc, setSelectedDoc] = useState<DoctorRecommendation | null>(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState("2026-07-10");
  const [bookingTime, setBookingTime] = useState("10:00 AM");
  const [bookingType, setBookingType] = useState<"Video" | "In-Person">("Video");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Consultation history list
  const [sessions, setSessions] = useState<{ consultant: string; system: string; date: string; duration: string; type: string; status: string }[]>([]);

  // Load and listen for changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPlan = localStorage.getItem("echocare-active-plan");
      if (storedPlan) setActivePlan(storedPlan);

      const storedSessions = localStorage.getItem("echocare-consultations");
      if (storedSessions) {
        try { setSessions(JSON.parse(storedSessions)); } catch { setSessions([]); }
      }
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const surveyData = readJson<Record<string, unknown>>("echocare-survey", {});
      const storyAnalysis = readJson<Record<string, unknown> | undefined>("echocare-story-analysis", undefined);
      const trackerLog = readJson<Record<string, unknown>>("echocare-tracker-log", {});
      const reports = readJson<Array<{ name?: string; reportType?: string; summary?: string; extractedText?: string }>>("echocare-diagnostic-reports", []);
      const symptoms = [
        ...(Array.isArray(surveyData.symptoms) ? surveyData.symptoms.map(String) : []),
        ...(Array.isArray(storyAnalysis?.detectedSymptoms) ? storyAnalysis.detectedSymptoms.map(String) : []),
        typeof surveyData.mainConcern === "string" ? surveyData.mainConcern : "",
      ].filter(Boolean);

      try {
        const res = await fetch("/api/integrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symptoms,
            surveyData: {
              ...surveyData,
              trackerSummary: trackerLog,
              reportSummaries: reports.slice(0, 3).map(report => ({
                name: report.name,
                type: report.reportType,
                summary: report.summary || report.extractedText?.slice(0, 300),
              })),
            },
            storyAnalysis,
          }),
        });
        const data = await res.json();
        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions);
        } else {
          throw new Error("Empty response");
        }
      } catch {
        const { generateIntegrativeSuggestions } = await import("@/lib/gemini");
        setSuggestions(await generateIntegrativeSuggestions({ symptoms, surveyData, storyAnalysis }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeSystem = useMemo(() => {
    if (suggestions.length === 0 || selectedSystemIdx >= suggestions.length) return null;
    return suggestions[selectedSystemIdx];
  }, [suggestions, selectedSystemIdx]);

  const activeSystemColor = useMemo(() => {
    if (!activeSystem) return systemColors.Allopathy;
    return systemColors[activeSystem.system] || systemColors.Allopathy;
  }, [activeSystem]);

  const systemDoctors = useMemo(() => {
    if (!activeSystem) return [];
    const storyAnalysis = readJson<{ suggestedDepartments?: { dept: string }[] } | undefined>("echocare-story-analysis", undefined);
    return personalizeDoctors(activeSystem, storyAnalysis);
  }, [activeSystem]);

  const isCarePlus = activePlan === "Care+";

  const handleConfirmBooking = () => {
    if (!selectedDoc) return;
    setSubmittingBooking(true);

    setTimeout(() => {
      const newSession = {
        consultant: selectedDoc.name,
        system: selectedDoc.system,
        date: `${new Date(bookingDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} · ${bookingTime}`,
        duration: "30 mins",
        type: bookingType,
        status: "Scheduled",
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      if (typeof window !== "undefined") {
        localStorage.setItem("echocare-consultations", JSON.stringify(updatedSessions));
      }

      setBookingConfirmed(true);
      setSubmittingBooking(false);
    }, 1200);
  };

  return (
    <AppLayout 
      title="Integrative Care & Booking Hub" 
      subtitle="Explore clinically matched medicine systems and directly book appointments with verified specialists."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px" }}>

        {/* 1. HERO GRADIENT BANNER */}
        <div style={{ 
          padding: "32px", 
          borderRadius: "24px", 
          background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0E7490 100%)", 
          position: "relative", 
          overflow: "hidden",
          boxShadow: "0 12px 30px rgba(13,148,136,0.15)",
          color: "white"
        }}>
          <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(20px)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <Sparkles size={18} color="#2DD4BF" />
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#2DD4BF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Patient-Centered System Matching</span>
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "10px" }}>
              Unified Integrative Explorer & Specialty Booking
            </h2>
            <p style={{ fontSize: "14.5px", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, maxWidth: "750px" }}>
              Select a medicine system to analyze AI matching factors (benefits, limitations, and precautions) based on your health survey. Book appointments directly with recommended practitioners in that system with verified, transparent pricing.
            </p>
          </div>
        </div>

        {/* 2. CLINICAL SAFETY DISCLAIMER */}
        <div style={{ padding: "16px 20px", borderRadius: "16px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", gap: "12px" }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <p style={{ fontSize: "13px", color: "#92400E", lineHeight: 1.6 }}>
              <strong>Important Clinical Disclaimer:</strong> All match percentages are advisory and reflect profile indicators, not efficacy. Consultation booking charges transparently split between doctor fees and platform fees.
            </p>
          </div>
        </div>

        {/* 3. CORE INTEGRATIVE EXPLORER & PRACTITIONERS GRID */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card animate-pulse" style={{ padding: "24px", height: "120px", background: "var(--surface)" }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* System Selectors Column (1/4 Width) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "4px" }}>Matched Treatment Systems</div>
              {suggestions.map((s, idx) => {
                const sysColor = systemColors[s.system] || systemColors.Allopathy;
                const isSelected = selectedSystemIdx === idx;
                return (
                  <div
                    key={s.system}
                    onClick={() => setSelectedSystemIdx(idx)}
                    style={{
                      padding: "16px", borderRadius: "18px",
                      border: isSelected ? `2.5px solid ${sysColor.color}` : "1.5px solid var(--border)",
                      background: isSelected ? sysColor.bg : "var(--surface)",
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>{s.icon}</span>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)" }}>{s.system}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{s.confidence}% match</div>
                      </div>
                    </div>
                    <ChevronRight size={16} color={isSelected ? sysColor.color : "var(--text-muted)"} />
                  </div>
                );
              })}
            </div>

            {/* Selected System details & Doctors list (3/4 Width) */}
            {activeSystem && (
              <div className="lg:col-span-3 flex flex-col gap-6">
                
                {/* Medicine System Profile Card */}
                <div className="card" style={{ padding: "28px", borderTop: `5px solid ${activeSystemColor.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "28px" }}>{activeSystem.icon}</span>
                        <h3 style={{ fontSize: "19px", fontWeight: 800, color: "var(--text-primary)" }}>{activeSystem.system} Overview</h3>
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                        <EvidenceBadge level={activeSystem.evidenceLevel} />
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "100px", background: "rgba(34,197,94,0.08)", fontSize: "11px", fontWeight: 700, color: "#22C55E" }}>
                          <Zap size={9} /> {activeSystem.confidence}% match score
                        </div>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
                    {activeSystem.description}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="grid grid-cols-1 md:grid-cols-2">
                    
                    {/* Left Column: Focus, Benefits, Limitations */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Focus Areas</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {activeSystem.typicalFocus.map((f, i) => (
                            <span key={i} style={{ padding: "4px 12px", borderRadius: "100px", background: activeSystemColor.bg, border: `1.5px solid ${activeSystemColor.border}`, fontSize: "11.5px", fontWeight: 700, color: activeSystemColor.color }}>{f}</span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#22C55E", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Potential Benefits</div>
                        {activeSystem.benefits.map((b, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "var(--text-secondary)", alignItems: "flex-start" }}>
                            <Check size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: "2.5px" }} />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Limitations</div>
                        {activeSystem.limitations.map((l, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "var(--text-secondary)", alignItems: "flex-start" }}>
                            <span style={{ color: "#F59E0B", flexShrink: 0, marginTop: "-1px" }}>—</span>
                            <span>{l}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Precautions & AI Match Rationale */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Precautions</div>
                        {activeSystem.precautions.map((p, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "12px", color: "#DC2626", alignItems: "flex-start" }}>
                            <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: "2px" }} />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(59,130,246,0.03)", border: "1px solid rgba(59,130,246,0.12)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 800, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                          <BookOpen size={12} /> AI Suggestion Indicators
                        </div>
                        {activeSystem.aiReasoning.symptoms.length > 0 && (
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#EF4444", marginBottom: "3px" }}>Symptoms Analyzed:</div>
                            {activeSystem.aiReasoning.symptoms.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>• {s}</div>)}
                          </div>
                        )}
                        {activeSystem.aiReasoning.surveyFactors.length > 0 && (
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#3B82F6", marginBottom: "3px" }}>Survey Factors:</div>
                            {activeSystem.aiReasoning.surveyFactors.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>• {s}</div>)}
                          </div>
                        )}
                        {activeSystem.aiReasoning.lifestyleFactors.length > 0 && (
                          <div>
                            <div style={{ fontSize: "10px", fontWeight: 800, color: "#22C55E", marginBottom: "3px" }}>Lifestyle Factors:</div>
                            {activeSystem.aiReasoning.lifestyleFactors.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "2px" }}>• {s}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommended Doctor List for this System */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: "4px" }}>
                    Recommended {activeSystem.system} Practitioners
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {systemDoctors.map((doc, idx) => {
                      const outcomeStr = outcomeFromSuggestion(activeSystem);

                      return (
                        <div key={idx} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
                              <div style={{
                                width: "44px", height: "44px", borderRadius: "50%",
                                background: `linear-gradient(135deg, ${activeSystemColor.color}a0, ${activeSystemColor.color}30)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "white", fontSize: "18px", fontWeight: 800, flexShrink: 0
                              }}>
                                {doc.avatar}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "2px" }}>{doc.name}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{doc.qualification} · {doc.specialization}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <div style={{ display: "flex", alignItems: "center" }}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star key={i} size={11} color="#F59E0B" fill={i < Math.floor(doc.rating) ? "#F59E0B" : "none"} />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>{doc.rating}</span>
                                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>({doc.reviews} reviews)</span>
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: activeSystemColor.color }}>₹{doc.fee}</div>
                                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>doc fee</span>
                              </div>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                              <span style={{ fontSize: "10px", padding: "2px 8px", background: "var(--background)", borderRadius: "4px", border: "1px solid var(--border-light)" }}>🏥 {doc.hospital}</span>
                              <span style={{ fontSize: "10px", padding: "2px 8px", background: "var(--background)", borderRadius: "4px", border: "1px solid var(--border-light)" }}>⏱ {doc.experience} yrs exp</span>
                              <span style={{ fontSize: "10px", padding: "2px 8px", background: "var(--background)", borderRadius: "4px", border: "1px solid var(--border-light)" }}>🗣 {doc.languages.slice(0,2).join(", ")}</span>
                            </div>

                            <div style={{
                              padding: "8px 12px", borderRadius: "8px", background: activeSystemColor.bg,
                              border: `1px solid ${activeSystemColor.border}`, fontSize: "11.5px", color: "var(--text-secondary)",
                              marginBottom: "10px", lineHeight: 1.45
                            }}>
                              <strong style={{ color: activeSystemColor.color }}>Why this practitioner:</strong> {doc.matchReason}
                            </div>

                            <div style={{
                              padding: "8px 12px", borderRadius: "8px", background: "rgba(15,118,110,0.04)",
                              border: "1px solid rgba(15,118,110,0.12)", fontSize: "11.5px", color: "#0F766E",
                              display: "flex", gap: "6px", alignItems: "center", marginBottom: "14px"
                            }}>
                              <Users size={12} color="#0F766E" />
                              <span>User-data match: <strong>{outcomeStr}</strong></span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              onClick={() => {
                                setSelectedDoc(doc);
                                setBookingConfirmed(false);
                              }}
                              className="btn btn-primary"
                              style={{
                                flex: 1, fontSize: "12.5px", paddingTop: "8px", paddingBottom: "8px", fontWeight: 700,
                                background: activeSystemColor.color, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px"
                              }}
                            >
                              <Calendar size={13} /> Book Consultation
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* 4. TREATMENT FEEDBACK REDIRECT BANNER */}
        <div className="card" style={{
          padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, rgba(15,118,110,0.06), rgba(20,184,166,0.03))",
          border: "1px solid rgba(15,118,110,0.15)", borderRadius: "16px"
        }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>Have you completed an appointment?</div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Help the community by providing anonymous feedback on your doctor's diagnostic approach.</div>
          </div>
          <Link href="/feedback" className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
            Give Feedback <ArrowRight size={14} />
          </Link>
        </div>

        {/* 5. CONSULTATION HISTORY */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Clock size={16} color="#0F766E" />
            Your Scheduled & Past Consultations
          </h3>
          {sessions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sessions.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--border)", background: "white" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.type === "Video" ? <Video size={16} color="#3B82F6" /> : <Phone size={16} color="#3B82F6" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 750, color: "var(--text-primary)" }}>{s.consultant}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.system} · {s.date} · {s.duration}</div>
                  </div>
                  <div className={`badge badge-${s.status === "Scheduled" ? "primary animate-pulse" : "success"}`} style={{ fontSize: "10.5px" }}>{s.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13px" }}>
              No consultations scheduled yet. Book a practitioner from the explorer above.
            </div>
          )}
        </div>

      </div>

      {/* TRANSPARENT BILLING BOOKING MODAL */}
      {selectedDoc && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div className="card animate-scale-in" style={{
            background: "white", color: "black", width: "100%", maxWidth: "480px",
            padding: "32px", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.2)"
          }}>
            <button 
              onClick={() => setSelectedDoc(null)}
              style={{
                position: "absolute", top: "20px", right: "20px", background: "none",
                border: "none", cursor: "pointer", color: "#64748B"
              }}
            >
              <X size={20} />
            </button>

            {bookingConfirmed ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(34,197,94,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <Check size={28} color="#22C55E" />
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginBottom: "8px" }}>Consultation Confirmed!</h3>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                  Your {bookingType} appointment with <strong>{selectedDoc.name}</strong> is scheduled for <strong>{new Date(bookingDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })} at {bookingTime}</strong>.
                </p>
                <div style={{ marginTop: "12px", fontSize: "11px", color: "#22C55E", fontWeight: 700 }}>
                  ✓ Medical consultation fee belongs 100% to the doctor.
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="btn btn-primary"
                  style={{ marginTop: "24px", width: "100%", paddingTop: "10px", paddingBottom: "10px" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <span style={{ fontSize: "9px", fontWeight: 800, color: "#0F766E", textTransform: "uppercase", letterSpacing: "0.08em" }}>Confirm Consultation Booking</span>
                  <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0F172A", marginTop: "4px" }}>{selectedDoc.name}</h3>
                  <p style={{ fontSize: "12.5px", color: "#64748B" }}>{selectedDoc.qualification} · {selectedDoc.specialization}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Select Date</label>
                    <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="form-input" style={{ fontSize: "13px" }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Select Time Slot</label>
                    <select value={bookingTime} onChange={e => setBookingTime(e.target.value)} className="form-input" style={{ fontSize: "13px" }}>
                      <option value="09:00 AM">09:00 AM - Morning Slot</option>
                      <option value="10:00 AM">10:00 AM - Morning Slot</option>
                      <option value="11:30 AM">11:30 AM - Morning Slot</option>
                      <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                      <option value="04:30 PM">04:30 PM - Evening Slot</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: "11px", fontWeight: 700, color: "#475569" }}>Consultation Format</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["Video", "In-Person"] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBookingType(t)}
                          style={{
                            flex: 1, padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
                            border: bookingType === t ? "2px solid #0F766E" : "1.5px solid #E2E8F0",
                            background: bookingType === t ? "rgba(15,118,110,0.04)" : "white",
                            color: bookingType === t ? "#0F766E" : "#475569", cursor: "pointer"
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* TRANSPARENT TRANSACTION PRICING BREAKDOWN */}
                <div style={{
                  padding: "16px", borderRadius: "14px", background: "#F8FAFC",
                  border: "1.5px solid #E2E8F0"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748B", textTransform: "uppercase", marginBottom: "8px" }}>Billing Summary</div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", borderBottom: "1px dashed #E2E8F0", paddingBottom: "10px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#475569" }}>Doctor Consultation Fee:</span>
                      <span style={{ fontWeight: 700, color: "#0F172A" }}>₹{selectedDoc.fee}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#475569", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        Platform Service Fee:
                        <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: isCarePlus ? "#22C55E" : "#94A3B8", color: "white" }}>
                          {isCarePlus ? "Care+" : "Standard"}
                        </span>
                      </span>
                      <span style={{ fontWeight: 700, color: isCarePlus ? "#22C55E" : "#0F172A" }}>
                        {isCarePlus ? "₹0 (Waived)" : "₹49"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: 800 }}>
                    <span>Total Amount Payable:</span>
                    <span style={{ color: "#0F766E" }}>₹{selectedDoc.fee + (isCarePlus ? 0 : 49)}</span>
                  </div>

                  <p style={{ fontSize: "10.5px", color: "#64748B", marginTop: "10px", lineHeight: 1.4 }}>
                    *Note: 100% of the doctor consultation fee goes to the practitioner. EchoCare charges only for AI coordination and support service booking.
                  </p>
                </div>

                <button 
                  onClick={handleConfirmBooking}
                  disabled={submittingBooking}
                  className="btn btn-primary"
                  style={{ width: "100%", paddingTop: "11px", paddingBottom: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  {submittingBooking ? "Processing Transaction..." : `Pay & Schedule Appointment`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </AppLayout>
  );
}

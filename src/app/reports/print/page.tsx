"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Heart, Activity, FileText, Stethoscope, Sparkles } from "lucide-react";

export default function PrintReportPage() {
  const { user } = useAuth();
  const name = user?.name ?? "Patient";
  const [patientStory, setPatientStory] = useState("");
  const [hasReports, setHasReports] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPatientStory(localStorage.getItem("patientStory") || "The patient describes persistent fatigue ongoing for over 12 months, accompanied by morning joint stiffness and mild cognitive fog. Standard blood work has returned normal. Sleep is reported as non-refreshing, and physical exercise is avoided due to potential flare-ups.");
      setHasReports(true);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      maxWidth: "800px", margin: "0 auto", padding: "40px 24px",
      fontFamily: "'Inter', sans-serif", color: "#1E293B", background: "white"
    }}>
      {/* Print stylesheet */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Control bar */}
      <div className="no-print" style={{
        display: "flex", gap: "12px", padding: "16px 20px", borderRadius: "12px",
        background: "#F8FAFC", border: "1px solid #E2E8F0", marginBottom: "32px",
        alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Print Preview</h2>
          <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0" }}>This report is formatted for sharing with your doctor.</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => window.close()}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>Print / Export PDF</button>
        </div>
      </div>

      <div className="print-container">
        {/* Letterhead */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "3px solid #0F766E", paddingBottom: "20px", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #0F766E, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={14} color="white" fill="white" />
              </div>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.03em" }}>Echo<span style={{ color: "#0F766E" }}>Care</span></span>
            </div>
            <span style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", display: "block" }}>Personalized Patient Health Summary</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Report Generated:</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A" }}>{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </div>
        </div>

        {/* Patient Profile */}
        <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px", border: "1px solid #E2E8F0" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Patient Name</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>{name}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Date of Birth</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>Jan 15, 1995</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Blood Type</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>O+</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>EchoCare ID</div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", marginTop: "2px" }}>EC-77291</div>
          </div>
        </div>

        {/* Story Section */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F766E", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px", marginBottom: "12px" }}>
            📝 Patient Narrative (Self-Reported)
          </h3>
          <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#334155", fontStyle: "italic", whiteSpace: "pre-line" }}>
            &quot;{patientStory}&quot;
          </p>
        </div>

        {/* Daily Health Log Summary */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F766E", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px", marginBottom: "12px" }}>
            📊 21-Day Tracking Averages
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
            {[
              { label: "Avg Sleep", val: "6.8 hrs", rating: "Below Target" },
              { label: "Water Intake", val: "6 cups/day", rating: "Borderline" },
              { label: "Stress Level", val: "Moderate (5.2)", rating: "Normal" },
              { label: "Energy Level", val: "Low (4.2)", rating: "Attention" },
              { label: "Pain Score", val: "Mild (3.1)", rating: "Normal" },
            ].map((item, i) => (
              <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#0F172A" }}>{item.val}</div>
                <div style={{ fontSize: "11px", color: "#64748B", fontWeight: 600, marginTop: "2px" }}>{item.label}</div>
                <div style={{ fontSize: "9px", fontWeight: 700, color: item.rating === "Normal" ? "#22C55E" : "#F59E0B", marginTop: "4px" }}>{item.rating}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Uploaded Lab Reports */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F766E", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px", marginBottom: "12px" }}>
            📁 Uploaded Medical Documents Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { name: "Blood Test Report (May 20, 2025)", remark: "Vitamin D is low (18 ng/mL). Ferritin levels are borderline." },
              { name: "MRI Brain Scan (May 15, 2025)", remark: "No structural abnormalities detected. Clear scan." },
              { name: "X-Ray Chest (May 10, 2025)", remark: "Clear lung fields, normal heart size." },
            ].map((rep, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", padding: "8px 0" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0F766E", marginTop: "6px" }} />
                <div>
                  <strong>{rep.name}</strong> — <span style={{ color: "#475569" }}>{rep.remark}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0F766E", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #E2E8F0", paddingBottom: "6px", marginBottom: "12px" }}>
            🏥 AI Companion Referrals & Suggestions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
            {/* Suggested Depts */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "8px" }}>Suggested Departments</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { dept: "Rheumatology", reason: "Persistent joint stiffness and fatigue linked to poor sleep patterns.", match: "87%" },
                  { dept: "Endocrinology", reason: "Fatigue accompanied by low Vitamin D and borderline low ferritin levels.", match: "72%" },
                ].map((d, i) => (
                  <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A" }}>{d.dept}</span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#0F766E" }}>{d.match} confidence</span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748B" }}>{d.reason}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Actions */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: "8px" }}>Actions to Discuss with Doctor</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "Request an ANA panel and inflammatory markers (ESR, CRP)",
                  "Evaluate morning joint stiffness duration (minutes)",
                  "Discuss Vitamin D3 supplementation (target >30 ng/mL)",
                ].map((act, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px" }}>
                    <span>{i + 1}.</span>
                    <span style={{ color: "#475569" }}>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: "40px", borderTop: "1px solid #E2E8F0", paddingTop: "16px", fontSize: "11px", color: "#64748B", lineHeight: 1.6 }}>
          <p>
            <strong>Disclaimer:</strong> This EchoCare Clinical Summary Report is generated entirely based on patient-provided narratives, self-reported daily lifestyle trackers, and uploaded laboratory summaries. This analysis is produced by a non-diagnostic AI assistant and is intended strictly as a discussion reference for medical professionals. It does not constitute a medical diagnosis or treatment recommendation.
          </p>
        </div>
      </div>
    </div>
  );
}

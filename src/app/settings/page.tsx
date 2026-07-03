"use client";
import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { Moon, Bell, Shield, Trash2, Lock, Globe, Smartphone, Download, Check, Info, Sparkles, X, type LucideProps } from "lucide-react";

type SettingsSwitchItem = {
  label: string;
  desc: string;
  type: "switch";
  on: boolean;
};

type SettingsSelectItem = {
  label: string;
  desc: string;
  type: "select";
  value: string;
};

type SettingsButtonItem = {
  label: string;
  desc: string;
  type: "button";
  buttonLabel: string;
  buttonIcon: React.ComponentType<LucideProps>;
};

type SettingsItem = SettingsSwitchItem | SettingsSelectItem | SettingsButtonItem;

type SettingsSection = {
  title: string;
  icon: React.ComponentType<LucideProps>;
  items: SettingsItem[];
};

const sections: SettingsSection[] = [
  {
    title: "Appearance", icon: Moon, items: [
      { label: "Dark Mode", desc: "Switch between light and dark theme", type: "switch", on: false },
      { label: "Language", desc: "App display language", type: "select", value: "English" },
      { label: "Compact View", desc: "Show more content with less spacing", type: "switch", on: false },
    ]
  },
  {
    title: "Notifications", icon: Bell, items: [
      { label: "Push Notifications", desc: "Enable browser push notifications", type: "switch", on: true },
      { label: "Email Alerts", desc: "Receive health alerts via email", type: "switch", on: true },
      { label: "Reminder Frequency", desc: "How often to send check-in reminders", type: "select", value: "Daily" },
    ]
  },
  {
    title: "Privacy & Security", icon: Shield, items: [
      { label: "Two-Factor Authentication", desc: "Add extra security to your account", type: "switch", on: false },
      { label: "Session Timeout", desc: "Automatically log out after inactivity", type: "select", value: "30 minutes" },
      { label: "Analytics", desc: "Allow anonymous usage analytics to improve EchoCare", type: "switch", on: true },
    ]
  },
  {
    title: "Data & Privacy", icon: Lock, items: [
      { label: "Data Export", desc: "Download all your health data as JSON", type: "button", buttonLabel: "Export Data", buttonIcon: Download },
      { label: "Connected Devices", desc: "Sync with Apple Health, Google Fit", type: "button", buttonLabel: "Manage", buttonIcon: Smartphone },
      { label: "Data Retention", desc: "How long we keep your data", type: "select", value: "Forever (I control deletion)" },
    ]
  },
];

export default function SettingsPage() {
  const [activePlan, setActivePlan] = useState("Free");
  const [showPlansModal, setShowPlansModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("echocare-subscription");
      if (stored) {
        setActivePlan(stored);
      }
    }
  }, []);

  const handleSelectPlan = (plan: string) => {
    setActivePlan(plan);
    if (typeof window !== "undefined") {
      localStorage.setItem("echocare-subscription", plan);
      // Trigger local storage storage event for dynamic updates on other pages
      window.dispatchEvent(new Event("storage"));
    }
    setShowPlansModal(false);
  };

  const getPlanDescription = (plan: string) => {
    switch (plan) {
      case "Basic": return "Unlimited AI chat & explainable summaries.";
      case "Premium": return "Advanced reports exploration & clinical analytics.";
      case "Care+": return "Human care coordinator support & waived platform fees.";
      default: return "Basic symptom logs & limited AI chats.";
    }
  };

  return (
    <AppLayout title="Settings" subtitle="Customize your EchoCare experience">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "720px" }}>
        
        {/* Subscription Plan Card */}
        <div className="card" style={{ padding: "24px", background: "linear-gradient(135deg, rgba(15,118,110,0.06) 0%, rgba(20,184,166,0.02) 100%)", border: "1px solid rgba(15,118,110,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(15,118,110,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Sparkles size={20} color="#0F766E" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Subscription Model</h3>
                  <span className="badge badge-primary" style={{ background: "#0F766E", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 8px" }}>
                    {activePlan} Plan
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  {getPlanDescription(activePlan)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowPlansModal(true)} 
              className="btn btn-primary btn-sm"
              style={{ fontSize: "12px" }}
            >
              Upgrade / Change Plan
            </button>
          </div>
        </div>

        {/* Upgrade Modal */}
        {showPlansModal && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
          }}>
            <div className="card animate-scale-in" style={{
              background: "var(--surface)", width: "100%", maxWidth: "900px",
              maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative"
            }}>
              <button 
                onClick={() => setShowPlansModal(false)}
                style={{
                  position: "absolute", top: "24px", right: "24px", background: "none",
                  border: "none", cursor: "pointer", color: "var(--text-muted)"
                }}
              >
                <X size={20} />
              </button>

              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Choose Subscription Plan</h2>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Select the level of AI assistance and care advocacy you require.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { plan: "Free", price: "₹0", desc: "Essential tracking tools.", features: ["Basic symptom tracking", "Limited AI chats", "Daily health logs", "Dashboard", "Limited report uploads"] },
                  { plan: "Basic", price: "₹199–299/mo", desc: "Unlimited companion chats.", features: ["Unlimited AI chat", "Detailed health insights", "Explainable AI", "Report summaries", "Health trends"] },
                  { plan: "Premium", price: "₹499–799/mo", desc: "Advanced report analysis.", features: ["Everything in Basic", "Unlimited report analysis", "Priority AI responses", "Advanced analytics", "Wellness plans", "Exportable health reports"] },
                  { plan: "Care+", price: "₹999–1499/mo", desc: "AI plus human coordinator.", features: ["Everything in Premium", "Doctor consultation booking", "Care coordinator support", "Family member management", "Priority assistance"] }
                ].map((p, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      padding: "20px 16px", borderRadius: "16px", border: activePlan === p.plan ? "2px solid #0F766E" : "1.5px solid var(--border)",
                      background: activePlan === p.plan ? "rgba(15,118,110,0.02)" : "transparent",
                      display: "flex", flexDirection: "column", justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{p.plan}</span>
                        {activePlan === p.plan && <Check size={14} color="#0F766E" />}
                      </div>
                      <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--text-primary)", margin: "10px 0 4px" }}>{p.price}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "14px" }}>{p.desc}</div>
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                        {p.features.map((f, fi) => (
                          <li key={fi} style={{ display: "flex", alignItems: "start", gap: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
                            <Check size={11} color="#0F766E" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button 
                      onClick={() => handleSelectPlan(p.plan)}
                      disabled={activePlan === p.plan}
                      className={`btn ${activePlan === p.plan ? "btn-secondary" : "btn-primary"} btn-sm`}
                      style={{ marginTop: "20px", width: "100%", fontSize: "11px", padding: "8px" }}
                    >
                      {activePlan === p.plan ? "Current Plan" : "Select"}
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "24px", padding: "12px 16px", borderRadius: "12px", background: "rgba(15,118,110,0.05)", border: "1px solid rgba(15,118,110,0.15)", display: "flex", gap: "8px" }}>
                <Info size={14} color="#0F766E" style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: 1.5, textAlign: "left" }}>
                  EchoCare charges for AI Companion features and human Care Coordinators. If you book doctor consultations, the doctor fees are charged separately and belong <strong>100% to the doctor</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
        {sections.map((section, si) => (
          <div key={si} className="card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(15,118,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <section.icon size={17} color="#0F766E" />
              </div>
              <div className="section-title">{section.title}</div>
            </div>

            {section.items.map((item, ii) => (
              <div key={ii} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: ii < section.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.desc}</div>
                </div>
                {item.type === "switch" && (
                  <button className={`switch ${item.on ? "on" : ""}`} />
                )}
                {item.type === "select" && (
                  <select className="form-input" style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}>
                    <option>{item.value}</option>
                  </select>
                )}
                {item.type === "button" && (
                  <button className="btn btn-secondary btn-sm" style={{ gap: "6px" }}>
                    {item.buttonIcon && <item.buttonIcon size={13} />}
                    {item.buttonLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* Danger zone */}
        <div className="card" style={{ padding: "24px", borderColor: "rgba(239,68,68,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Trash2 size={17} color="#EF4444" />
            </div>
            <div className="section-title" style={{ color: "#EF4444" }}>Danger Zone</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Delete Account</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Permanently delete your account and all health data. This cannot be undone.</div>
            </div>
            <button className="btn btn-danger btn-sm">Delete Account</button>
          </div>
        </div>

        {/* App info */}
        <div style={{ textAlign: "center", padding: "16px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>EchoCare v1.0.0 · Made with ❤️ for patients</div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            <a href="#" style={{ color: "var(--text-muted)" }}>Privacy Policy</a> · <a href="#" style={{ color: "var(--text-muted)" }}>Terms of Service</a> · <a href="#" style={{ color: "var(--text-muted)" }}>Help Center</a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

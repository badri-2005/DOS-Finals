"use client";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/components/AuthProvider";
import { Camera, Globe, Phone, MapPin, Heart, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const displayName = user?.name ?? "Patient";
  const email = user?.email ?? "your.email@example.com";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <AppLayout title="My Profile" subtitle="Manage your personal health profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left card */}
        <div className="lg:col-span-1" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "32px", textAlign: "center" }}>
            <div style={{ position: "relative", width: "fit-content", margin: "0 auto 20px" }}>
              <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(135deg, #0F766E, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: 900, color: "white", margin: "0 auto" }}>
                {avatarInitial}
              </div>
              <button style={{ position: "absolute", bottom: 0, right: 0, width: "32px", height: "32px", borderRadius: "50%", background: "#0F766E", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={14} color="white" />
              </button>
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{displayName}</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Patient · EchoCare Member</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "8px" }}>
              <Globe size={13} color="#4285F4" />
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Signed in with Google</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "24px" }}>
              {[{ label: "Days", val: "14" }, { label: "Reports", val: "4" }, { label: "Insights", val: "8" }].map(s => (
                <div key={s.label} style={{ padding: "12px 8px", background: "var(--background)", borderRadius: "12px" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: "#0F766E" }}>{s.val}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "20px" }}>
            <div className="section-title" style={{ marginBottom: "14px" }}>Health Preferences</div>
            {[
              { label: "Primary Goal", value: "Understand symptoms" },
              { label: "Primary Concern", value: "Chronic fatigue" },
              { label: "Notifications", value: "Daily reminders on" },
            ].map((pref, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{pref.label}</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "2px" }}>{pref.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Personal details */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <div className="section-title">Personal Details</div>
              <button className="btn btn-secondary btn-sm"><Edit3 size={13} /> Edit</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Full Name", value: displayName },
                { label: "Email", value: email },
                { label: "Date of Birth", value: "January 15, 1995" },
                { label: "Gender", value: "Male" },
                { label: "Blood Type", value: "O+" },
                { label: "Height / Weight", value: "175 cm / 72 kg" },
              ].map((field, i) => (
                <div key={i} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--border)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency contact */}
          <div className="card" style={{ padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Heart size={16} color="#EF4444" />
                <div className="section-title">Emergency Contact</div>
              </div>
              <button className="btn btn-secondary btn-sm"><Edit3 size={13} /> Edit</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              {[
                { label: "Name", value: "Priya (Sister)", icon: null },
                { label: "Phone", value: "+91 98765 43210", icon: Phone },
                { label: "City", value: "Chennai, India", icon: MapPin },
              ].map((ec, i) => (
                <div key={i} className="form-group">
                  <label className="form-label">{ec.label}</label>
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "var(--background)", border: "1px solid var(--border)", fontSize: "14px", fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {ec.icon && <ec.icon size={14} color="var(--text-muted)" />}
                    {ec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google account */}
          <div className="card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(66,133,244,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Globe size={24} color="#4285F4" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Google Account</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{email} · Connected via OAuth 2.0</div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}>Disconnect</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

"use client";
import AppLayout from "@/components/AppLayout";
import { Bell, Pill, Calendar, Activity, AlertCircle, Check, Trash2 } from "lucide-react";

const notifications = [
  { icon: Pill, title: "Medication Reminder", desc: "Take your Vitamin D supplement (2000 IU)", time: "2 minutes ago", type: "warning", unread: true },
  { icon: Activity, title: "Daily Check-in Due", desc: "You haven't logged your health today. It only takes 2 minutes!", time: "1 hour ago", type: "primary", unread: true },
  { icon: AlertCircle, title: "New AI Insight Available", desc: "EchoCare has detected a new pattern in your health data.", time: "3 hours ago", type: "info", unread: true },
  { icon: Calendar, title: "Appointment Reminder", desc: "Follow-up with Dr. Priya Mehta tomorrow at 10:00 AM", time: "5 hours ago", type: "accent", unread: false },
  { icon: Bell, title: "Weekly Health Summary", desc: "Your weekly health summary is ready. View your progress.", time: "Yesterday", type: "success", unread: false },
  { icon: Pill, title: "Medication Reminder", desc: "Evening medication dose — remember to take it before bed.", time: "Yesterday", type: "warning", unread: false },
  { icon: Activity, title: "Streak at Risk!", desc: "Don't break your 14-day tracking streak — log today's health.", time: "2 days ago", type: "danger", unread: false },
];

const colorMap: Record<string, string> = {
  warning: "#F59E0B", primary: "#0F766E", info: "#3B82F6",
  accent: "#8B5CF6", success: "#22C55E", danger: "#EF4444"
};

export default function NotificationsPage() {
  return (
    <AppLayout title="Notifications" subtitle="Stay on top of your health reminders and alerts">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="badge badge-danger" style={{ fontSize: "13px", padding: "6px 14px" }}>
            3 unread
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary btn-sm"><Check size={13} /> Mark all read</button>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--danger)" }}><Trash2 size={13} /> Clear all</button>
          </div>
        </div>

        {/* Notification list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((n, i) => {
            const color = colorMap[n.type];
            return (
              <div key={i} className="notification-item" style={{ borderColor: n.unread ? `${color}25` : "var(--border)", background: n.unread ? `${color}04` : "var(--surface)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <n.icon size={18} color={color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{n.title}</span>
                    {n.unread && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, flexShrink: 0 }} />}
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{n.desc}</p>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>{n.time}</span>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ padding: "6px" }}><Trash2 size={13} color="var(--text-muted)" /></button>
              </div>
            );
          })}
        </div>

        {/* Notification settings */}
        <div className="card" style={{ padding: "24px" }}>
          <div className="section-title" style={{ marginBottom: "16px" }}>Notification Preferences</div>
          {[
            { label: "Daily check-in reminders", desc: "Remind me to log my health daily", on: true },
            { label: "Medication reminders", desc: "Alert me to take my medications", on: true },
            { label: "Appointment reminders", desc: "Notify me before consultancy sessions", on: true },
            { label: "AI insight alerts", desc: "Alert me when new insights are detected", on: false },
            { label: "Weekly summaries", desc: "Send weekly health overview", on: true },
          ].map((pref, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{pref.label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{pref.desc}</div>
              </div>
              <button className={`switch ${pref.on ? "on" : ""}`} />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard, BookOpen, ClipboardList, Activity,
  FileText, Brain, Lightbulb, HeartHandshake, Leaf,
  Phone, Bell, User, Settings, LogOut, Heart,
  ChevronLeft, ChevronRight, MessageSquare, Sparkles, Star,
  ShieldAlert
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/survey", icon: ClipboardList, label: "Health Survey" },
  { href: "/story", icon: BookOpen, label: "Patient Story" },
  { href: "/insights", icon: Brain, label: "Health Insights" },
  { href: "/diagnostic-guard", icon: ShieldAlert, label: "Diagnostic Guard" },
  { href: "/integrative", icon: Sparkles, label: "Integrative Care & Booking" },
  { href: "/tracker", icon: Activity, label: "Daily Tracker" },
  { href: "/chat", icon: MessageSquare, label: "AI Companion" },
  { href: "/feedback", icon: Star, label: "Treatment Feedback" },
];

const bottomItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`} style={{ width: collapsed ? "72px" : "260px" }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
            background: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Heart size={18} color="white" fill="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.02em" }}>EchoCare</div>
              <div style={{ color: "#475569", fontSize: "11px", fontWeight: 500 }}>AI Healthcare Companion</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? "active" : ""}`} title={collapsed ? item.label : undefined}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span style={{ flex: 1 }}>{item.label}</span>
              )}
            </Link>
          );
        })}

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />

        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`sidebar-item ${isActive ? "active" : ""}`} title={collapsed ? item.label : undefined}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        <button onClick={handleLogout} className="sidebar-item" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }} title={collapsed ? "Logout" : undefined}>
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item"
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", justifyContent: collapsed ? "center" : "flex-start" }}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span style={{ fontSize: "13px" }}>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

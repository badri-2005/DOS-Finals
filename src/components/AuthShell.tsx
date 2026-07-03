"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const PUBLIC_PATHS = ["/", "/login", "/signup"];
const ONBOARDING_PATHS = ["/survey", "/story", "/insights", "/integrative"];

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/login");
      return;
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
      // First-time user → go through onboarding survey
      if (!user.surveyCompleted) {
        router.replace("/survey");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)", color: "var(--text-primary)" }}>
        <div style={{ textAlign: "center", padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.94)", boxShadow: "0 12px 36px rgba(15,118,110,0.12)" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>EchoCare</div>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Loading your experience...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

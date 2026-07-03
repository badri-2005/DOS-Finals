"use client";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #F0FDF9 0%, #F8FAFC 100%)",
      fontFamily: "'Inter', sans-serif", textAlign: "center", padding: "40px"
    }}>
      <div>
        <div style={{ fontSize: "120px", fontWeight: 900, color: "rgba(15,118,110,0.1)", letterSpacing: "-0.05em", lineHeight: 1 }}>404</div>
        <div style={{ marginTop: "-20px", marginBottom: "24px" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg, #0F766E, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Heart size={30} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "10px" }}>Page not found</h1>
          <p style={{ fontSize: "15px", color: "#64748B", maxWidth: "380px", margin: "0 auto", lineHeight: 1.7 }}>
            The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the link may be incorrect.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          <Link href="/" className="btn btn-secondary"><ArrowLeft size={15} /> Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

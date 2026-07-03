"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultancyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/integrative");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
      Redirecting to Integrative Care & Booking...
    </div>
  );
}

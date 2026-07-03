"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/login" && pathname !== "/signup" && pathname !== "/") {
      router.push("/login");
    }
  }, [loading, user, pathname, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", background: "var(--background)" }}>
        Loading EchoCare...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

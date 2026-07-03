"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Globe, Shield, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { loginWithBackend, fetchCurrentUser } from "@/lib/backend";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace(user.surveyCompleted ? "/dashboard" : "/survey");
    }
  }, [user, router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }

    setLoading(true);
    try {
      // 1. Get JWT from FastAPI MongoDB backend
      const { access_token } = await loginWithBackend(email.trim(), password.trim());

      // 2. Fetch user profile from MongoDB using the token
      const dbUser = await fetchCurrentUser(access_token);
      if (!dbUser) throw new Error("Could not load profile.");

      // 3. Store user + token in AuthProvider & localStorage
      login({
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        activePlan: dbUser.active_plan,
        surveyCompleted: false, // will be updated by survey page
        token: access_token,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F1929 0%, #0A2233 60%, #0D3B3B 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 70%)", top: "-100px", right: "-100px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", bottom: "-100px", left: "-100px", pointerEvents: "none" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", maxWidth: "900px", width: "100%", borderRadius: "24px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
        {/* Left panel */}
        <div style={{
          background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)",
          padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={20} color="white" fill="white" />
              </div>
              <span style={{ fontWeight: 800, fontSize: "20px", color: "white", letterSpacing: "-0.03em" }}>EchoCare</span>
            </div>
          </div>

          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
            <svg viewBox="0 0 300 300" width="260" height="260" xmlns="http://www.w3.org/2000/svg">
              <circle cx="150" cy="150" r="130" fill="rgba(255,255,255,0.07)" />
              <circle cx="150" cy="150" r="100" fill="rgba(255,255,255,0.07)" />
              <polyline points="60,150 85,150 95,120 110,175 125,110 140,160 155,150 175,150 185,135 200,165 215,150 240,150" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <g transform="translate(150, 90)">
                <rect x="-14" y="-5" width="28" height="10" rx="4" fill="rgba(255,255,255,0.9)" />
                <rect x="-5" y="-14" width="10" height="28" rx="4" fill="rgba(255,255,255,0.9)" />
              </g>
              <circle cx="150" cy="195" r="20" fill="rgba(255,255,255,0.15)" />
              <path d="M120,240 Q150,210 180,240" fill="rgba(255,255,255,0.15)" />
              <circle cx="80" cy="80" r="5" fill="rgba(255,255,255,0.3)" />
              <circle cx="220" cy="80" r="3" fill="rgba(255,255,255,0.2)" />
              <circle cx="90" cy="220" r="4" fill="rgba(255,255,255,0.25)" />
              <circle cx="210" cy="220" r="6" fill="rgba(255,255,255,0.2)" />
            </svg>
          </div>

          <div>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "white", letterSpacing: "-0.03em", marginBottom: "12px" }}>
              Your health story matters.
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
              EchoCare listens to your complete story and helps you find the answers you&apos;ve been looking for.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
              {[{ text: "HIPAA Aligned" }, { text: "Encrypted Data" }].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={13} color="rgba(255,255,255,0.7)" />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div style={{ background: "white", padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "8px" }}>Welcome back</h1>
            <p style={{ fontSize: "14px", color: "#64748B" }}>Sign in to continue your health journey with EchoCare.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="form-input"
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label className="form-label">Password</label>
                <a href="#" style={{ fontSize: "12px", color: "#0F766E", textDecoration: "none", fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", padding: "0" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: "100%", padding: "13px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B", marginTop: "8px" }}>
            Don&apos;t have an account? <a href="/signup" style={{ color: "#0F766E", fontWeight: 600, textDecoration: "none" }}>Sign up free</a>
          </p>

          <div style={{ marginTop: "24px", padding: "14px 16px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.06)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <AlertTriangle size={14} color="#D97706" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "11px", color: "#92400E", lineHeight: 1.6 }}>
                EchoCare provides AI-assisted health insights, not medical diagnoses. Always consult a qualified healthcare professional before making medical decisions.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
            <Globe size={12} color="#94A3B8" />
            <span style={{ fontSize: "11px", color: "#94A3B8" }}>Secured with MongoDB Atlas · JWT Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}

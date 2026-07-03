"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Globe, Shield, AlertTriangle, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { registerWithBackend, loginWithBackend, fetchCurrentUser } from "@/lib/backend";

export default function SignupPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/survey");
    }
  }, [user, router]);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      setError("Please complete all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // 1. Register the user in MongoDB via FastAPI
      await registerWithBackend(email.trim(), password.trim(), name.trim());

      // 2. Auto-login to get the JWT token
      const { access_token } = await loginWithBackend(email.trim(), password.trim());

      // 3. Fetch the created user profile from MongoDB
      const dbUser = await fetchCurrentUser(access_token);
      if (!dbUser) throw new Error("Account created but could not load profile.");

      setSuccess(true);
      await new Promise(r => setTimeout(r, 800)); // brief success flash

      // 4. Store in AuthProvider & redirect to survey
      login({
        id: dbUser.id,
        name: dbUser.full_name,
        email: dbUser.email,
        activePlan: dbUser.active_plan,
        surveyCompleted: false,
        token: access_token,
      });

      router.push("/survey");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColor = ["transparent", "#EF4444", "#F59E0B", "#22C55E"][passwordStrength];
  const strengthLabel = ["", "Weak", "Fair", "Strong"][passwordStrength];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0F1929 0%, #0A2233 60%, #0D3B3B 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', sans-serif", position: "relative", overflow: "hidden"
    }}>
      <div style={{ position: "absolute", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(15,118,110,0.12) 0%, transparent 70%)", top: "-100px", left: "-100px", pointerEvents: "none" }} />

      <div style={{ background: "white", borderRadius: "24px", padding: "52px 52px", maxWidth: "520px", width: "100%", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #0F766E, #14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={18} color="white" fill="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: "18px", color: "#0F172A" }}>EchoCare</span>
        </div>

        <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.03em", marginBottom: "6px" }}>Create your account</h1>
        <p style={{ fontSize: "14px", color: "#64748B", marginBottom: "28px" }}>Start your personalized health journey. It&apos;s free.</p>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              id="signup-name"
              value={name}
              onChange={e => setName(e.target.value)}
              type="text"
              className="form-input"
              placeholder="Enter your name"
              disabled={loading}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="signup-email"
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
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="signup-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Min. 8 characters"
                disabled={loading}
                autoComplete="new-password"
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
            {password.length > 0 && (
              <div style={{ marginTop: "6px", display: "flex", gap: "4px", alignItems: "center" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= passwordStrength ? strengthColor : "#E2E8F0", transition: "background 0.3s" }} />
                ))}
                <span style={{ fontSize: "11px", color: strengthColor, fontWeight: 600, marginLeft: "6px", minWidth: "36px" }}>{strengthLabel}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              id="signup-confirm"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              type="password"
              className="form-input"
              placeholder="Confirm your password"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", borderRadius: "10px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle2 size={15} color="#22C55E" />
              <span style={{ fontSize: "13px", color: "#15803D", fontWeight: 600 }}>Account created! Redirecting...</span>
            </div>
          )}

          <button
            id="signup-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading || success}
            style={{ width: "100%", padding: "13px", fontSize: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "#64748B" }}>
          Already have an account? <a href="/login" style={{ color: "#0F766E", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "20px" }}>
          {[{ icon: Shield, text: "HIPAA Aligned" }, { icon: Globe, text: "MongoDB Atlas" }].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <item.icon size={12} color="#94A3B8" />
              <span style={{ fontSize: "11px", color: "#94A3B8" }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

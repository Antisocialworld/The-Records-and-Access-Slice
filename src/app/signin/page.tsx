"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type Step = "email" | "method" | "otp" | "everyday";

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  padding: "2.5rem",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.85rem",
  fontSize: "0.95rem",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const btnPrimary: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#2563eb",
  color: "#fff",
  transition: "background 0.15s",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  opacity: 0.5,
  cursor: "not-allowed",
};

const btnSecondary: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem",
  fontSize: "0.95rem",
  fontWeight: 500,
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#fff",
  color: "#374151",
  transition: "border-color 0.15s, background 0.15s",
};

const errorBanner: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  fontSize: "0.85rem",
  color: "#991b1b",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  marginBottom: "1rem",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.35rem",
};

const subtext: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#6b7280",
  lineHeight: 1.5,
};

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Everyday Code
  const [everydayCode, setEverydayCode] = useState("");
  const [ecAttemptsWarning, setEcAttemptsWarning] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // --- Step 1: Email ---
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    if (data.hasEverydayCode) {
      setStep("method");
    } else {
      await requestOtp();
    }
    setLoading(false);
  }

  // --- Request OTP ---
  async function requestOtp() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setStep("otp");
    setOtpDigits(["", "", "", "", "", ""]);
    setResendTimer(60);
    setLoading(false);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  }

  // --- Step 2: Method choice ---
  function handleChooseOtp() { requestOtp(); }
  function handleChooseEveryday() { setStep("everyday"); setEverydayCode(""); setError(""); setEcAttemptsWarning(""); }

  // --- Step 3a: OTP input ---
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    if (digit && index === 5) {
      const code = next.join("");
      if (code.length === 6) verifyOtp(code);
    }
  }

  function handleOtpKeyDown(index: number, key: string) {
    if (key === "Backspace" && !otpDigits[index] && index > 0) otpRefs.current[index - 1]?.focus();
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) setTimeout(() => verifyOtp(pasted), 100);
  }

  async function verifyOtp(code: string) {
    setError(""); setLoading(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setOtpDigits(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setLoading(false);
      return;
    }
    router.push(data.redirect || "/projects");
  }

  // --- Step 3b: Everyday Code submit ---
  async function handleEverydaySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setEcAttemptsWarning(""); setLoading(true);
    const res = await fetch("/api/auth/verify-everyday-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: everydayCode.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 429) {
        setEcAttemptsWarning(data.error);
      } else {
        setError(data.error);
      }
      setEverydayCode("");
      setLoading(false);
      return;
    }
    router.push(data.redirect || "/projects");
  }

  // --- Render ---
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: "1rem" }}>
      <div style={card}>
        {step === "email" && (
          <>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>Sign in to your account</h1>
            <p style={{ ...subtext, marginBottom: "1.5rem" }}>Enter your email to continue.</p>
            <form onSubmit={handleEmailSubmit}>
              <label style={label}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={input} autoFocus />
              {error && <div style={errorBanner}>{error}</div>}
              <button type="submit" disabled={loading} style={loading ? btnDisabled : btnPrimary}>{loading ? "Checking…" : "Continue"}</button>
            </form>
          </>
        )}

        {step === "method" && (
          <>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>Choose sign-in method</h1>
            <p style={{ ...subtext, marginBottom: "1.5rem" }}>How would you like to sign in to <strong>{email}</strong>?</p>
            <button onClick={handleChooseOtp} disabled={loading} style={{ ...btnSecondary, textAlign: "left", marginBottom: "0.75rem", display: "block" }}>
              <span style={{ fontWeight: 600, color: "#111827" }}>Email one-time code</span>
              <br />
              <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>We&apos;ll send a 6-digit code to your email.</span>
            </button>
            <button onClick={handleChooseEveryday} disabled={loading} style={{ ...btnSecondary, textAlign: "left", display: "block" }}>
              <span style={{ fontWeight: 600, color: "#111827" }}>Everyday Code</span>
              <br />
              <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>Enter your short PIN for quick sign-in.</span>
            </button>
            <button onClick={() => { setStep("email"); setError(""); }} style={{ ...btnSecondary, marginTop: "1.25rem", background: "transparent", border: "none", color: "#6b7280", fontSize: "0.85rem" }}>
              ← Use a different email
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>Check your email</h1>
            <p style={{ ...subtext, marginBottom: "1.5rem" }}>We sent a 6-digit code to <strong>{email}</strong>.</p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "1rem" }}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e.key)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: "48px", height: "56px", textAlign: "center", fontSize: "1.4rem", fontWeight: 600,
                    border: "1px solid #d1d5db", borderRadius: "8px", outline: "none",
                    transition: "border-color 0.15s",
                  }}
                />
              ))}
            </div>
            {error && <div style={errorBanner}>{error}</div>}
            {loading && <p style={{ ...subtext, textAlign: "center", marginBottom: "0.75rem" }}>Verifying…</p>}
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              {resendTimer > 0 ? (
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Resend code in {resendTimer}s</span>
              ) : (
                <button onClick={requestOtp} disabled={loading} style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}>
                  Resend code
                </button>
              )}
            </div>
            <button onClick={() => { setStep("method"); setError(""); setOtpDigits(["","","","","",""]); }} style={{ ...btnSecondary, background: "transparent", border: "none", color: "#6b7280", fontSize: "0.85rem" }}>
              ← Back
            </button>
          </>
        )}

        {step === "everyday" && (
          <>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>Enter Everyday Code</h1>
            <p style={{ ...subtext, marginBottom: "1.5rem" }}>Enter your short PIN for <strong>{email}</strong>.</p>
            <form onSubmit={handleEverydaySubmit}>
              <label style={label}>Everyday Code</label>
              <input
                type="password"
                value={everydayCode}
                onChange={(e) => setEverydayCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="4-8 digit code"
                autoFocus
                style={input}
              />
              {error && <div style={errorBanner}>{error}</div>}
              {ecAttemptsWarning && (
                <div style={{ ...errorBanner, background: "#fffbeb", border: "color: #fde68a", color: "#92400e", borderColor: "#fde68a" }}>
                  {ecAttemptsWarning}
                </div>
              )}
              <button type="submit" disabled={loading || everydayCode.length < 4} style={loading || everydayCode.length < 4 ? btnDisabled : btnPrimary}>
                {loading ? "Verifying…" : "Sign In"}
              </button>
            </form>
            <button onClick={() => { setStep("method"); setError(""); setEcAttemptsWarning(""); setEverydayCode(""); }} style={{ ...btnSecondary, marginTop: "1rem", background: "transparent", border: "none", color: "#6b7280", fontSize: "0.85rem" }}>
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

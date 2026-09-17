"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  email: string;
  hasEverydayCode: boolean;
  everydayCodeUpdatedAt: string | null;
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
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
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: "#dc2626",
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
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  opacity: 0.5,
  cursor: "not-allowed",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.35rem",
};

const banner: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  fontSize: "0.9rem",
  marginBottom: "1.5rem",
};

export function SecuritySettings({ email, hasEverydayCode: initialHas, everydayCodeUpdatedAt: initialUpdatedAt }: Props) {
  const [hasEverydayCode, setHasEverydayCode] = useState(initialHas);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);

  // Set/Update form
  const [code, setCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Remove confirmation
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  function handleSetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code !== confirmCode) { setError("Codes do not match"); return; }
    if (!/^\d{4,8}$/.test(code)) { setError("Everyday Code must be 4-8 digits"); return; }
    setShowConfirm(true);
  }

  async function handleConfirmSet() {
    setError(""); setLoading(true);
    const res = await fetch("/api/user/everyday-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); setShowConfirm(false); return; }
    setSuccess(hasEverydayCode ? "Everyday Code updated" : "Everyday Code set successfully");
    setHasEverydayCode(true);
    setUpdatedAt(new Date().toISOString());
    setCode(""); setConfirmCode(""); setShowConfirm(false); setLoading(false);
  }

  async function handleConfirmRemove() {
    setError(""); setLoading(true);
    const res = await fetch("/api/user/everyday-code", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); setShowRemoveConfirm(false); return; }
    setSuccess("Everyday Code removed");
    setHasEverydayCode(false);
    setUpdatedAt(null);
    setShowRemoveConfirm(false); setLoading(false);
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", marginBottom: "0.25rem" }}>Security Settings</h1>
      <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>
        Signed in as <strong>{email}</strong>
      </p>
      <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>Manage your Everyday Code for quick sign-in.</p>

      {/* Status banner */}
      <div style={{
        ...banner,
        background: hasEverydayCode ? "#f0fdf4" : "#f9fafb",
        border: `1px solid ${hasEverydayCode ? "#bbf7d0" : "#e5e7eb"}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{
            display: "inline-block", width: "8px", height: "8px", borderRadius: "50%",
            background: hasEverydayCode ? "#22c55e" : "#9ca3af",
          }} />
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}>
            Everyday Code: {hasEverydayCode ? "Configured" : "Not set"}
          </span>
        </div>
        {updatedAt && (
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.35rem", marginLeft: "1rem" }}>
            Last updated: {new Date(updatedAt).toLocaleString()}
          </div>
        )}
      </div>

      {error && <div style={{ ...banner, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>{error}</div>}
      {success && <div style={{ ...banner, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" }}>{success}</div>}

      {/* Set / Update — with confirmation step */}
      {!showConfirm ? (
        <form onSubmit={handleSetSubmit}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>
            {hasEverydayCode ? "Update Everyday Code" : "Set Everyday Code"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1rem" }}>
            A 4-8 digit PIN for quick sign-in. You can always use email OTP instead.
          </p>
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={label}>{hasEverydayCode ? "New code" : "Code"}</label>
            <input type="password" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="4-8 digits" style={input} />
          </div>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={label}>Confirm code</label>
            <input type="password" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Re-enter code" style={input} />
          </div>
          <button type="submit" disabled={loading || code.length < 4} style={loading || code.length < 4 ? btnDisabled : btnPrimary}>
            {hasEverydayCode ? "Update Code" : "Set Code"}
          </button>
        </form>
      ) : (
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#111827", marginBottom: "0.75rem" }}>Confirm change</h2>
          <div style={{ ...banner, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", marginBottom: "1.25rem" }}>
            {hasEverydayCode
              ? "You are about to update your Everyday Code. Your old code will stop working immediately."
              : "You are about to set an Everyday Code. You will be able to use it for quick sign-in."}
          </div>
          <button onClick={handleConfirmSet} disabled={loading} style={loading ? btnDisabled : btnPrimary}>
            {loading ? "Saving…" : "Confirm"}
          </button>
          <button onClick={() => setShowConfirm(false)} disabled={loading} style={{ ...btnSecondary, marginTop: "0.75rem" }}>
            Cancel
          </button>
        </div>
      )}

      {/* Remove — with confirmation step */}
      {hasEverydayCode && (
        <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
          {!showRemoveConfirm ? (
            <button onClick={() => { setShowRemoveConfirm(true); setError(""); setSuccess(""); }} style={{ ...btnSecondary, borderColor: "#fca5a5", color: "#dc2626" }}>
              Remove Everyday Code
            </button>
          ) : (
            <div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#991b1b", marginBottom: "0.75rem" }}>Confirm removal</h2>
              <div style={{ ...banner, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", marginBottom: "1.25rem" }}>
                You will no longer be able to sign in with your Everyday Code. You can always set a new one later.
              </div>
              <button onClick={handleConfirmRemove} disabled={loading} style={loading ? btnDisabled : btnDanger}>
                {loading ? "Removing…" : "Yes, remove it"}
              </button>
              <button onClick={() => setShowRemoveConfirm(false)} disabled={loading} style={{ ...btnSecondary, marginTop: "0.75rem" }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
        <Link href="/projects" style={{ fontSize: "0.85rem", color: "#6b7280" }}>← Back to Projects</Link>
      </div>
    </div>
  );
}

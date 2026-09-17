"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

const pageWrap: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f9fafb",
  padding: "1rem",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  padding: "2.5rem",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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

const errorBanner: React.CSSProperties = {
  padding: "0.65rem 0.85rem",
  fontSize: "0.85rem",
  color: "#991b1b",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  marginBottom: "1rem",
};

export function CreateProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/projects?project=${data.project.publicId}`);
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", margin: 0 }}>Create Project</h1>
          <SignOutButton />
        </div>
        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.5rem" }}>Give your project a name.</p>
        <form onSubmit={handleSubmit}>
          <label style={label}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project name"
            maxLength={200}
            required
            autoFocus
            style={input}
          />
          {error && <div style={errorBanner}>{error}</div>}
          <button type="submit" disabled={submitting || !title.trim()} style={submitting || !title.trim() ? btnDisabled : btnPrimary}>
            {submitting ? "Creating…" : "Create Project"}
          </button>
        </form>
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
          <Link href="/projects" style={{ fontSize: "0.85rem", color: "#6b7280" }}>← Back to Projects</Link>
        </div>
      </div>
    </div>
  );
}

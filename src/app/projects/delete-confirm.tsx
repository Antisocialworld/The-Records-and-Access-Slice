"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

type Project = { publicId: string; title: string; createdAt: Date | string };

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

const btnDanger: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#dc2626",
  color: "#fff",
};

const btnDisabled: React.CSSProperties = {
  ...btnDanger,
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

export function DeleteConfirm({ project }: { project: Project }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/projects/${project.publicId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Delete failed");
      setDeleting(false);
      return;
    }

    router.push("/projects");
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#991b1b", margin: 0 }}>Delete Project</h1>
          <SignOutButton />
        </div>
        <p style={{ fontSize: "0.95rem", color: "#374151", marginBottom: "1.5rem" }}>
          Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
        </p>
        <div style={{ padding: "0.75rem 1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span style={{ fontSize: "0.85rem", color: "#991b1b" }}>This will permanently delete the project and its records.</span>
          </div>
        </div>
        {error && <div style={errorBanner}>{error}</div>}
        <button onClick={handleDelete} disabled={deleting} style={deleting ? btnDisabled : btnDanger}>
          {deleting ? "Deleting…" : "Yes, delete project"}
        </button>
        <Link href={`/projects?project=${project.publicId}`} style={{ ...btnSecondary, display: "block", textAlign: "center", marginTop: "0.75rem", textDecoration: "none" }}>
          Cancel
        </Link>
      </div>
    </div>
  );
}

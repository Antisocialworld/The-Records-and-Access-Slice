"use client";

import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

type Project = { publicId: string; title: string; createdAt: Date | string };

const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

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
  border: "1px solid #fca5a5",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#fff",
  color: "#dc2626",
};

export function ProjectDetail({ project, showCreatedBanner }: { project: Project; showCreatedBanner?: boolean }) {
  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FolderIcon />
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", margin: 0 }}>{project.title}</h1>
          </div>
          <SignOutButton />
        </div>
        {showCreatedBanner && (
          <div style={{ padding: "0.65rem 0.85rem", fontSize: "0.85rem", color: "#065f46", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "8px", marginBottom: "1rem" }}>
            Project created successfully.
          </div>
        )}
        <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>Created</div>
          <div style={{ fontSize: "0.95rem", color: "#111827", fontWeight: 500 }}>{new Date(project.createdAt).toLocaleString()}</div>
        </div>
        <Link href={`/projects?project=${project.publicId}&delete=1`} style={{ ...btnDanger, display: "block", textAlign: "center", textDecoration: "none" }}>
          Delete this project
        </Link>
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
          <Link href="/projects" style={{ fontSize: "0.85rem", color: "#6b7280" }}>← Back to Projects</Link>
        </div>
      </div>
    </div>
  );
}

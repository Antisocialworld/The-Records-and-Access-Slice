"use client";

import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

type Project = { publicId: string; title: string; createdAt: Date | string };

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const EmptyFolderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
  maxWidth: "520px",
  padding: "2.5rem",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  padding: "0.65rem 1.25rem",
  fontSize: "0.95rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  background: "#2563eb",
  color: "#fff",
  textDecoration: "none",
  textAlign: "center",
};

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", margin: 0 }}>My Projects</h1>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link href="/settings/security" style={{ fontSize: "0.85rem", color: "#6b7280", textDecoration: "none", padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #e5e7eb" }}>Settings</Link>
              <SignOutButton />
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "2rem 0" }}>
            <EmptyFolderIcon />
            <p style={{ fontSize: "1.05rem", color: "#374151", fontWeight: 500, marginTop: "1rem", marginBottom: "0.35rem" }}>No projects yet</p>
            <p style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "1.5rem" }}>Create your first project to get started.</p>
            <Link href="/projects?new=1" style={btnPrimary}>Create Project</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827", margin: 0 }}>My Projects</h1>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Link href="/settings/security" style={{ fontSize: "0.85rem", color: "#6b7280", textDecoration: "none", padding: "0.4rem 0.75rem", borderRadius: "6px", border: "1px solid #e5e7eb" }}>Settings</Link>
            <SignOutButton />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {projects.map((p) => (
            <Link
              key={p.publicId}
              href={`/projects?project=${p.publicId}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                textDecoration: "none",
                color: "#111827",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <FolderIcon />
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/projects?new=1" style={{ ...btnPrimary, display: "block", textAlign: "center" }}>New Project</Link>
      </div>
    </div>
  );
}

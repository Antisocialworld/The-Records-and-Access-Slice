"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/signin");
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={signingOut}
      style={{
        padding: "0.4rem 0.75rem",
        fontSize: "0.85rem",
        fontWeight: 500,
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        cursor: "pointer",
        background: "#fff",
        color: "#6b7280",
        transition: "border-color 0.15s, color 0.15s",
      }}
    >
      {signingOut ? "Signing out…" : "Sign Out"}
    </button>
  );
}

import { destroySession } from "@/lib/auth";

// POST /api/auth/logout — destroy the current session and clear the cookie.
export async function POST() {
  await destroySession();
  return Response.json({ ok: true });
}

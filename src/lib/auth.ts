// Passwordless auth core, built on database-backed sessions.
// Session tokens are random; the database stores only their hash (see
// ./session-token). This module is the request-bound half: it reads and
// writes the session cookie via next/headers.
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { generateSessionToken, hashToken } from "./session-token";

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// Create a session row and return the raw token. No cookie access, so this is
// callable outside a request (e.g. the seed script uses its own copy of this
// logic via the shared token module).
export async function createSessionToken(userId: string): Promise<string> {
  const token = generateSessionToken();
  await prisma.session.create({
    data: {
      userId,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function createSession(userId: string): Promise<string> {
  const token = await createSessionToken(userId);
  await setSessionCookie(token);
  return token;
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token: hashToken(token) } });
  }
  store.delete(SESSION_COOKIE);
}

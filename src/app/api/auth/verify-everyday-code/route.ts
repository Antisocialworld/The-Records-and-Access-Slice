import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

const MAX_FAILED = 5;

// POST /api/auth/verify-everyday-code — verify the Everyday Code passcode.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    code?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return Response.json({ error: "Email and code are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, everydayCodeHash: true, everydayCodeFailedAttempts: true },
  });

  if (!user || !user.everydayCodeHash) {
    return Response.json({ error: "Everyday Code is not set for this account." }, { status: 400 });
  }

  // Check lockout
  if (user.everydayCodeFailedAttempts >= MAX_FAILED) {
    return Response.json(
      { error: "Account locked due to repeated failed attempts. Please log in via Email OTP to reset lock." },
      { status: 429 },
    );
  }

  // Verify the code
  const valid = compareSync(code, user.everydayCodeHash);

  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { everydayCodeFailedAttempts: { increment: 1 } },
    });

    const remaining = MAX_FAILED - user.everydayCodeFailedAttempts - 1;
    return Response.json(
      { error: remaining > 0 ? `Invalid code. ${remaining} attempts remaining.` : "Invalid code. Account locked." },
      { status: 401 },
    );
  }

  // Success — reset failed attempts, create session
  await prisma.user.update({
    where: { id: user.id },
    data: { everydayCodeFailedAttempts: 0 },
  });

  const token = await createSession(user.id);
  await setSessionCookie(token);

  return Response.json({ success: true, redirect: "/projects" });
}

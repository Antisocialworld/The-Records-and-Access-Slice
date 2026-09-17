import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, setSessionCookie } from "@/lib/auth";

const MAX_ATTEMPTS = 3;

// POST /api/auth/verify-otp — verify a 6-digit OTP code.
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

  // Find the latest unconsumed, unexpired OTP for this email
  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      email,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return Response.json({ error: "No valid code found. Please request a new one." }, { status: 400 });
  }

  // Check attempt limit
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    // Burn the code
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumedAt: new Date() },
    });
    return Response.json({ error: "Too many attempts. Please request a new code." }, { status: 400 });
  }

  // Verify the code
  const valid = compareSync(code, otpRecord.codeHash);

  if (!valid) {
    // Increment attempts
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const remaining = MAX_ATTEMPTS - otpRecord.attempts - 1;
    return Response.json(
      { error: remaining > 0 ? `Invalid code. ${remaining} attempts remaining.` : "Invalid code. Too many attempts." },
      { status: 400 },
    );
  }

  // Mark code as consumed
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  // Upsert user (auto-provision on first sign-in)
  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: { everydayCodeFailedAttempts: 0 },
  });

  // Create session
  const token = await createSession(user.id);
  await setSessionCookie(token);

  return Response.json({ success: true, redirect: "/projects" });
}

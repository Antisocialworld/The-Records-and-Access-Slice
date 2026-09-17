import { randomInt } from "node:crypto";
import { hashSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/email";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_PENDING = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// POST /api/auth/request-otp — generate and store a 6-digit OTP.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Valid email is required" }, { status: 400 });
  }

  // Rate limit: max 3 pending (unconsumed, unexpired) codes per email per 10 minutes
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS);
  const pendingCount = await prisma.otpCode.count({
    where: {
      email,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      createdAt: { gte: windowStart },
    },
  });

  if (pendingCount >= MAX_PENDING) {
    return Response.json(
      { error: "Too many requests. Please wait before requesting another code." },
      { status: 429 },
    );
  }

  // Generate 6-digit numeric OTP
  const code = String(randomInt(0, 1_000_000)).padStart(OTP_LENGTH, "0");
  const codeHash = hashSync(code, 10);

  await prisma.otpCode.create({
    data: {
      email,
      codeHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });

  // Send email if credentials are configured, otherwise fall back to console
  const hasSmtp = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
  if (hasSmtp) {
    try {
      await sendOtpEmail(email, code);
    } catch (err) {
      console.error("SMTP send failed, falling back to console log:", err);
      console.log(`\n  ✉  OTP for ${email}: ${code}\n`);
    }
  } else {
    console.log(`\n  ✉  OTP for ${email}: ${code}\n`);
  }

  return Response.json({ message: "OTP sent successfully" });
}

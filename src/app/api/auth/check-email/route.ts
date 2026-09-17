import { prisma } from "@/lib/prisma";

// POST /api/auth/check-email — check if email exists and has Everyday Code.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
  } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Valid email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, everydayCodeHash: true },
  });

  return Response.json({
    exists: !!user,
    hasEverydayCode: !!user?.everydayCodeHash,
  });
}

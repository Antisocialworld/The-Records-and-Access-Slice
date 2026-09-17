import { hashSync } from "bcryptjs";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/user/everyday-code — set or update the Everyday Code.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
  } | null;
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code || !/^\d{4,8}$/.test(code)) {
    return Response.json({ error: "Everyday Code must be 4-8 digits" }, { status: 400 });
  }

  const codeHash = hashSync(code, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      everydayCodeHash: codeHash,
      everydayCodeUpdatedAt: new Date(),
      everydayCodeFailedAttempts: 0,
    },
  });

  return Response.json({ message: "Everyday Code set successfully" });
}

// DELETE /api/user/everyday-code — remove the Everyday Code.
export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      everydayCodeHash: null,
      everydayCodeUpdatedAt: null,
    },
  });

  return Response.json({ message: "Everyday Code removed" });
}

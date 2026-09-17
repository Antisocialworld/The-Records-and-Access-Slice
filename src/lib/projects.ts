import { randomBytes } from "node:crypto";
import { prisma } from "./prisma";

// Public-facing identifier for a project. Random and non-sequential, so it
// leaks nothing about the DB primary key and cannot be guessed by incrementing
// (PRD Requirement 2, SKILL-004).
export function newPublicId(): string {
  return randomBytes(16).toString("base64url");
}

// The ownership boundary lives here. Every function takes the authenticated
// userId and puts it INSIDE the query's where clause. There is deliberately no
// "fetch by id then compare" variant, because that pattern is the one future
// routes forget (SKILL-004). A non-owned row is simply never returned.
//
// All selects omit the raw `id` on purpose: the interface must never expose a
// database identifier.

export async function listProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { publicId: true, title: true, createdAt: true },
  });
}

export async function createProjectForUser(userId: string, title: string) {
  return prisma.project.create({
    data: { userId, title, publicId: newPublicId() },
    select: { publicId: true, title: true, createdAt: true },
  });
}

// Scoped lookup: returns null both when the project does not exist and when it
// belongs to someone else. Callers map null to 404, never 403 (a 403 would
// confirm the record exists for another user — an information leak).
export async function getProjectForUser(userId: string, publicId: string) {
  return prisma.project.findUnique({
    where: { userId_publicId: { userId, publicId } },
    select: { publicId: true, title: true, createdAt: true },
  });
}

// Atomic delete: scoped existence check, then [auditLog.create, project.delete]
// inside a single transaction. The audit row is written BEFORE the delete so
// the trail survives even if the delete fails. If the project doesn't exist
// (or belongs to another user), no audit row is created and false is returned.
export async function deleteProjectForUser(
  userId: string,
  publicId: string,
): Promise<boolean> {
  const existing = await prisma.project.findUnique({
    where: { userId_publicId: { userId, publicId } },
    select: { id: true },
  });

  if (!existing) return false;

  await prisma.$transaction([
    prisma.auditLog.create({
      data: { userId, action: "DELETE_PROJECT", targetPublicId: publicId },
    }),
    prisma.project.delete({ where: { id: existing.id } }),
  ]);

  return true;
}

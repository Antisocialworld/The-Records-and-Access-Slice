import { PrismaClient } from "@prisma/client";

// Single PrismaClient instance per process. In dev, Next's HMR re-evaluates
// modules on every edit; without caching on globalThis we would open a new
// connection pool each reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Query logging is opt-in: `log: ['query']` is how SKILL-004 measures
    // the query count per action. Default off so logs stay readable.
    log: process.env.PRISMA_QUERY_LOGGING === "true" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

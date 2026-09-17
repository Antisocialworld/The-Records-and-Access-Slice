// Dev/test fixture. Creates two accounts and mints one fresh session token
// each, printing them so the access-control audit can be run with two real
// sessions (SKILL-004: testing ownership with one account tests nothing).
//
// Run with env loaded:  npm run seed
// (uses `node --env-file=.env` so AUTH_SECRET matches the running app)
/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const { generateSessionToken, hashToken } = require("../src/lib/session-token");

const prisma = new PrismaClient();
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

const ACCOUNTS = [
  { label: "A", email: "alice@example.test" },
  { label: "B", email: "bob@example.test" },
];

async function main() {
  const result = [];

  for (const { label, email } of ACCOUNTS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    // One live session per seeded user: drop older ones so re-runs stay clean.
    await prisma.session.deleteMany({ where: { userId: user.id } });

    const token = generateSessionToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: hashToken(token),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    result.push({ label, email, userId: user.id, token });
  }

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

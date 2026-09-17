// CommonJS on purpose: this module is the single source of truth for session
// token hashing and must be requireable by the plain-Node seed script as well
// as importable (via allowJs) by the bundled Next app. Keeping it dependency-
// free means the seed cannot drift from the app's token scheme.
/* eslint-disable @typescript-eslint/no-require-imports */
const { createHash, randomBytes } = require("node:crypto");

// Opaque bearer token that goes in the cookie.
function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

// What we store in the database. AUTH_SECRET acts as a pepper so a database
// leak alone cannot be replayed as a valid session cookie.
function hashToken(token) {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHash("sha256").update(secret + ":" + token).digest("hex");
}

module.exports = { generateSessionToken, hashToken };

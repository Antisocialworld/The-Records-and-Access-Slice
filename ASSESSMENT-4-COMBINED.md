# ASSESSMENT 4 — The Records and Access Slice
## Combined PRD + AGENT_RULES + SKILL — Single File

---

## PART 1 — PRD-004

### What This Is
A records slice: signed-in users create, list, view, and delete
their own "Projects" (domain chosen: simple, generic, easy to
demo). No user can ever reach another user's records. What matters
is ownership, correct access control, and efficient data access —
not the record type itself.

Auth is reused from Assessment 1 (bcrypt, database-backed sessions),
adapted into this fresh repo. State this plainly in Section 1 of
DOCUMENTATION.md — reuse is not cheating, hiding it is.

### Stack
Next.js. Prisma. SQLite (matches Assessment 1's reasoning: no
signup, no server, no Docker, sufficient for a single-tester slice;
the honest tradeoff — weaker concurrent-write handling than
Postgres — stated in Section 7).

### Screens (exactly these, nothing more)
- List of the signed-in user's own Projects, with a true empty state
- Create Project
- Project detail view
- Delete with confirmation

### Behaviour
1. A user sees only their own records, everywhere, without
   exception.
2. Views change without full page loads, but the URL still updates
   (shareable/bookmarkable).
3. Deletion is recorded for audit before the record disappears.
4. Nothing in the URL or interface exposes a raw database
   identifier.

### Do Not Build
No landing page. No editing, search, tags, sharing, or
collaboration. No dashboard widgets. Create, list, view, delete —
that is all.

### Engineering Requirements (all 8)
1. Every query scoped to the authenticated user IN the query itself
   — never checked after fetching.
2. No raw DB identifiers in URLs or interface (use a public-facing
   slug/token, not the DB primary key, in any user-visible route).
3. An audit record written for every deletion (who/what/when),
   persisted before or as part of the delete.
4. Conditional views with URL state — fast nav, every view
   addressable.
5. Correct 401 vs 403 usage.
6. Measured + documented query count per main action, with a stated
   reduction from the first working version.
7. Indexes on filtered/sorted columns.
8. Genuine empty states — no placeholder or fake data.

### Concepts to Document (Section 5 — all 4 questions each)
Authentication vs authorisation. Query-scoping vs post-fetch
checking (why scoping makes a leak structurally impossible).
Insecure direct object references. Why raw DB identifiers aren't
exposed. Audit logging. Page architecture (conditional rendering +
URL state). 401 vs 403. Database indexing. Query count as a cost.

### Evidence Required
- Access control audit table: create 2 real users, attempt to reach
  user 1's data as user 2 on EVERY route (editing identifiers,
  replaying requests, direct curl calls). One row per route: method,
  path, attempt, result, pass/fail. Every row must say pass by
  submission. Table must show what was tried, not just the outcome.
- Query count table per main action, before/after reduction, each
  query's purpose classified.
- Screenshot of audit log after a deletion.
- Screenshot of a URL showing a non-DB identifier.

### Traps
Hiding the identifier is not access control (the ownership check
is). Post-fetch checks that get forgotten in future routes. Logging
deletion after the row is already gone. Building conditional views
but forgetting URL state. Testing access control with only ONE user
account (tests nothing — always use 2).

### Defence Questions
1. Show me a query and what happens if the user condition is
   removed from it.
2. I change the identifier in this URL to a value I guessed. Walk
   me through every layer that stops me.
3. Your query count went from X to Y. Which single change did the
   most, and why?
4. Why is this a 403 and not a 404 (or the reverse)?

---

## PART 2 — AGENT_RULES

Identical to Assessments 1-3, unchanged.

### Git
Never commit/stage/push without my explicit authorization. Read-only
git commands (status, diff, log) are always fine. Commit messages
describe what changed — never "update" or "fix." Never squash
unrelated changes into one commit.

### Scope discipline
Build only what PRD-004 lists under "What to build." Treat "Do not
build" as a hard boundary. If unsure whether something is in scope,
ask — don't guess.

### Environment variables and secrets
Secrets written into `.env` by hand, by me, never by you. Always
maintain `.env.example` with commented placeholders, no real values.
Confirm `.env` is gitignored before any commit is authorized.

### Database and migrations
Migrations are forward-only. Every constraint is a deliberate choice
— if you add one, tell me what invalid state it prevents.

### Documentation is not optional
`DOCUMENTATION.md` is written progressively, in the file itself —
not as an index pointing to other files. As each concept is
implemented, document it immediately.

### Evidence
Every "Prove it works" item needs actual screenshots, actual query
output, actual curl output — never a description of expected
behaviour presented as if it were confirmed.

### Sequencing
Build behaviours in the order they appear in PRD-004's "Behaviour"
list. Verify each before building the next on top of it.

---

## PART 3 — SKILL-004 (technical how-to)

### Query scoping (the core requirement)
Every Prisma query for a Project MUST include `where: { userId: ... }`
(or equivalent) as part of the query condition itself, never
`findUnique({ where: { id } })` followed by a separate
`if (project.userId !== session.userId)` check after the fact. The
scoped query returns null/empty for another user's record, which
you then map to a 404 (not 403 - see below).

```javascript
// Correct: scoping IS the security boundary
const project = await prisma.project.findFirst({
  where: { id: projectId, userId: session.userId },
});
if (!project) return notFound(); // "not mine" and "doesn't exist" look identical - correct
```

### 401 vs 403, applied here
401 = no valid session at all, redirect to signin.
403 = valid session, but this specific action is forbidden for a
reason unrelated to ownership (rare in this slice; most
"unauthorized access" cases here are actually "record doesn't exist
for you," which is a 404, not 403 or 401, because leaking "this ID
exists but isn't yours" via 403 is itself an information leak).

### No raw identifiers in URLs
Generate a separate, public-facing random string (e.g. nanoid() or
crypto.randomBytes) stored as a publicId column, distinct from the
Prisma id primary key. Routes use publicId, never the raw id. Query
still scopes on userId AND publicId together.

### Audit logging
A separate AuditLog table. On delete: write the audit row and delete
the Project in the SAME database transaction (Prisma $transaction),
so the audit record can never reference a row that already vanished,
and a delete can never succeed without leaving a trail.

```javascript
await prisma.$transaction([
  prisma.auditLog.create({ data: { userId, action: "DELETE_PROJECT", targetId: project.id } }),
  prisma.project.delete({ where: { id: project.id } }),
]);
```

### URL state without full page loads
Use Next.js's own client-side navigation (Link, router.push) for the
list to detail transition. This already updates the URL and avoids a
full reload by default in the App Router. No extra library needed.

### Query count measurement
Log every Prisma query during a request (Prisma's own query logging,
log: ['query'] in the client config) for each of the 3 main actions
(list, view, delete) before and after optimization (e.g. adding an
index, or combining an N+1 fetch into one include). Record the real
before/after counts in DOCUMENTATION.md.

### Indexing
Add @@index([userId]) on Project at minimum, every list/view query
filters by it. Add @@unique([userId, publicId]) if publicId lookups
are also scoped by user.

### The 2-user access control audit (mandatory evidence)
Create two real accounts. For every route, attempt as User B to
reach User A's data: (1) GET list, confirm A's records never appear.
(2) GET detail with A's real publicId, confirm 404. (3) DELETE with
A's real publicId, confirm 404 and confirm the record still exists
afterward. (4) Direct curl calls bypassing the UI entirely for each.
Log every attempt as its own row in a table, pass must be true for
every single row before submission.

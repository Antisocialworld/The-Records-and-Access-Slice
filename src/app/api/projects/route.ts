import { getSessionUser } from "@/lib/auth";
import { createProjectForUser, listProjectsForUser } from "@/lib/projects";

// GET /api/projects — the signed-in user's own projects only.
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await listProjectsForUser(user.id);
  return Response.json({ projects });
}

// POST /api/projects — creates a project owned by the signed-in user.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    title?: unknown;
  } | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!title) {
    return Response.json({ error: "Title is required" }, { status: 400 });
  }
  if (title.length > 200) {
    return Response.json(
      { error: "Title must be 200 characters or fewer" },
      { status: 400 },
    );
  }

  const project = await createProjectForUser(user.id, title);
  return Response.json({ project }, { status: 201 });
}

import { getSessionUser } from "@/lib/auth";
import { getProjectForUser, deleteProjectForUser } from "@/lib/projects";

// GET /api/projects/[publicId] — scoped detail lookup.
// Missing OR owned-by-someone-else both return 404: the query itself cannot
// return another user's row, so "not yours" and "doesn't exist" are
// indistinguishable from the caller's point of view (SKILL-004).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicId } = await params;
  const project = await getProjectForUser(user.id, publicId);
  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ project });
}

// DELETE /api/projects/[publicId] — atomic delete + audit trail.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicId } = await params;
  const deleted = await deleteProjectForUser(user.id, publicId);

  if (!deleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { listProjectsForUser, getProjectForUser } from "@/lib/projects";
import { ProjectList } from "./project-list";
import { CreateProjectForm } from "./create-form";
import { ProjectDetail } from "./project-detail";
import { DeleteConfirm } from "./delete-confirm";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/signin");
  }

  const params = await searchParams;
  const newView = params.new === "1";
  const publicId =
    typeof params.project === "string" ? params.project : undefined;
  const deleteView = params.delete === "1";

  if (newView) {
    return <CreateProjectForm />;
  }

  if (publicId) {
    const project = await getProjectForUser(user.id, publicId);
    if (!project) {
      redirect("/projects");
    }
    if (deleteView) {
      return <DeleteConfirm project={project} />;
    }
    return <ProjectDetail project={project} />;
  }

  const projects = await listProjectsForUser(user.id);
  return <ProjectList projects={projects} />;
}

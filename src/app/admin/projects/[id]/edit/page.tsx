import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProjectById, getDepartments } from "@/lib/db/queries/projects";
import { ProjectForm } from "@/components/projects/project-form";

interface AdminEditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProjectPage({ params }: AdminEditProjectPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  const [project, departments] = await Promise.all([
    getProjectById(projectId),
    getDepartments(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/admin/projects/${project.id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Edit Project</h2>
        <p className="text-muted-foreground">
          Update the details for &quot;{project.name}&quot;.
        </p>
      </div>

      <ProjectForm
        departments={departments}
        project={{
          id: project.id,
          name: project.name,
          description: project.description,
          department: project.department,
          leaderName: project.leaderName,
          leaderEmail: project.leaderEmail,
          status: project.status,
          decision: project.decision,
          decisionDate: project.decisionDate,
          decisionNotes: project.decisionNotes,
          startDate: project.startDate,
          updatedAt: project.updatedAt.toISOString(),
        }}
        basePath="/admin/projects"
      />
    </div>
  );
}

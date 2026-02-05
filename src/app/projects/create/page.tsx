import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDepartments } from "@/lib/db/queries/projects";
import { ProjectForm } from "@/components/projects/project-form";

export const dynamic = "force-dynamic";

export default async function CreateProjectPage() {
  const departments = await getDepartments();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/projects"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">New Project</h2>
        <p className="text-muted-foreground">
          Register a new innovation project for tracking and governance.
        </p>
      </div>

      <ProjectForm departments={departments} />
    </div>
  );
}

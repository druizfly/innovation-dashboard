import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllProjectOptions } from "@/lib/db/queries/lessons";
import { LessonForm } from "@/components/lessons/lesson-form";

export const dynamic = "force-dynamic";

export default async function AdminCreateLessonPage() {
  const allProjects = await getAllProjectOptions();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/lessons"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">New Lesson</h2>
        <p className="text-muted-foreground">
          Document an insight or lesson learned from a project.
        </p>
      </div>

      <LessonForm allProjects={allProjects} basePath="/admin/lessons" />
    </div>
  );
}

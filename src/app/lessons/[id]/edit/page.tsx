import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getLessonById,
  getAllProjectOptions,
} from "@/lib/db/queries/lessons";
import { LessonForm } from "@/components/lessons/lesson-form";

interface EditLessonPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({
  params,
}: EditLessonPageProps) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const [lesson, allProjects] = await Promise.all([
    getLessonById(lessonId),
    getAllProjectOptions(),
  ]);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/lessons/${lesson.id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lesson
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Edit Lesson</h2>
        <p className="text-muted-foreground">
          Update the details for &quot;{lesson.title}&quot;.
        </p>
      </div>

      <LessonForm
        allProjects={allProjects}
        lesson={{
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          author: lesson.author,
          tags: lesson.tags,
          relatedProjects: lesson.relatedProjects,
          updatedAt: lesson.updatedAt,
        }}
      />
    </div>
  );
}

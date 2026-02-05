import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Clock, Tag, FolderOpen } from "lucide-react";
import { getLessonById } from "@/lib/db/queries/lessons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteLessonButton } from "@/components/lessons/delete-lesson-button";
import { LessonMarkdown } from "@/components/lessons/lesson-markdown";

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function LessonDetailPage({
  params,
}: LessonDetailPageProps) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const lesson = await getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            href="/lessons"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lessons
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            {lesson.title}
          </h2>
          {lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {lesson.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/lessons/${lesson.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteLessonButton
            lessonId={lesson.id}
            lessonTitle={lesson.title}
          />
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6">
          <LessonMarkdown content={lesson.content} />
        </CardContent>
      </Card>

      {lesson.relatedProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Related Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lesson.relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="text-primary hover:underline block text-sm"
                >
                  {project.name}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm">{lesson.author}</p>
              <p className="text-muted-foreground text-xs">Author</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm">
                {dateFormatter.format(new Date(lesson.createdAt))}
              </p>
              <p className="text-muted-foreground text-xs">Created</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm">
                {dateFormatter.format(new Date(lesson.updatedAt))}
              </p>
              <p className="text-muted-foreground text-xs">Last Updated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

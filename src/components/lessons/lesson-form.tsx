"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createLesson, updateLesson } from "@/app/lessons/actions";

interface LessonFormProps {
  allProjects: { id: number; name: string }[];
  lesson?: {
    id: number;
    title: string;
    content: string;
    author: string;
    tags: string[];
    relatedProjects: { id: number; name: string }[];
    updatedAt: Date;
  };
}

type FormState = { error?: string; success?: boolean } | null;

export function LessonForm({ allProjects, lesson }: LessonFormProps) {
  const router = useRouter();
  const isEditing = !!lesson;

  const existingTagNames = lesson?.tags.join(", ") ?? "";
  const existingProjectIds = new Set(
    lesson?.relatedProjects.map((p) => p.id) ?? [],
  );

  async function formAction(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    if (isEditing) {
      formData.set("expectedUpdatedAt", lesson!.updatedAt.toISOString());
      const result = await updateLesson(lesson!.id, formData);
      if (result.success) {
        router.push(`/lessons/${lesson!.id}`);
        return { success: true };
      }
      return { error: result.error };
    } else {
      const result = await createLesson(formData);
      if (result.success) {
        router.push(`/lessons/${result.id}`);
        return { success: true };
      }
      return { error: result.error };
    }
  }

  const [state, action, pending] = useActionState(formAction, null);

  return (
    <form action={action} className="space-y-6">
      {state?.error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={255}
              defaultValue={lesson?.title ?? ""}
              placeholder="e.g., API versioning strategy for multi-tenant systems"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={12}
              defaultValue={lesson?.content ?? ""}
              placeholder="Describe the lesson learned in detail. Markdown is supported for formatting."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author *</Label>
            <Input
              id="author"
              name="author"
              required
              maxLength={255}
              defaultValue={lesson?.author ?? ""}
              placeholder="Full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={existingTagNames}
              placeholder="e.g., architecture, performance, security (comma-separated)"
            />
            <p className="text-muted-foreground text-xs">
              Enter tag names separated by commas. New tags will be created
              automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      {allProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {allProjects.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                >
                  <Checkbox
                    name="relatedProjectIds"
                    value={String(project.id)}
                    defaultChecked={existingProjectIds.has(project.id)}
                  />
                  <span className="text-sm">{project.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={pending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create Lesson"}
        </Button>
      </div>
    </form>
  );
}

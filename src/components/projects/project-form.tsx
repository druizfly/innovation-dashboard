"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProject, updateProject } from "@/app/projects/actions";

const STATUSES = [
  { value: "idea", label: "Idea" },
  { value: "development", label: "Development" },
  { value: "pilot", label: "Pilot" },
] as const;

const DECISIONS = [
  { value: "", label: "No decision yet" },
  { value: "advance", label: "Advance" },
  { value: "consolidate", label: "Consolidate" },
  { value: "pause", label: "Pause" },
] as const;

interface ProjectFormProps {
  departments: string[];
  project?: {
    id: number;
    name: string;
    description: string | null;
    department: string;
    leaderName: string;
    leaderEmail: string;
    status: string;
    decision: string | null;
    decisionDate: string | null;
    decisionNotes: string | null;
    startDate: string | null;
    updatedAt: Date;
  };
}

type FormState = { error?: string; success?: boolean } | null;

export function ProjectForm({ departments, project }: ProjectFormProps) {
  const router = useRouter();
  const isEditing = !!project;

  async function formAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    if (isEditing) {
      formData.set("expectedUpdatedAt", project!.updatedAt.toISOString());
      const result = await updateProject(project!.id, formData);
      if (result.success) {
        router.push(`/projects/${project!.id}`);
        return { success: true };
      }
      return { error: result.error };
    } else {
      const result = await createProject(formData);
      if (result.success) {
        router.push(`/projects/${result.id}`);
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
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={255}
              defaultValue={project?.name ?? ""}
              placeholder="e.g., AI-Powered Fraud Detection"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={project?.description ?? ""}
              placeholder="Describe the project, its goals, and expected outcomes..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select name="department" defaultValue={project?.department ?? ""} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={project?.status ?? "idea"} required>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Leader</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="leaderName">Name *</Label>
            <Input
              id="leaderName"
              name="leaderName"
              required
              maxLength={255}
              defaultValue={project?.leaderName ?? ""}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leaderEmail">Email *</Label>
            <Input
              id="leaderEmail"
              name="leaderEmail"
              type="email"
              required
              maxLength={255}
              defaultValue={project?.leaderEmail ?? ""}
              placeholder="email@company.com"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision & Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Select name="decision" defaultValue={project?.decision ?? ""}>
                <SelectTrigger id="decision">
                  <SelectValue placeholder="No decision yet" />
                </SelectTrigger>
                <SelectContent>
                  {DECISIONS.map((d) => (
                    <SelectItem key={d.value || "none"} value={d.value || "none"}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decisionDate">Decision Date</Label>
              <Input
                id="decisionDate"
                name="decisionDate"
                type="date"
                defaultValue={project?.decisionDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="decisionNotes">Decision Notes</Label>
            <Textarea
              id="decisionNotes"
              name="decisionNotes"
              rows={3}
              defaultValue={project?.decisionNotes ?? ""}
              placeholder="Rationale for the decision..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={project?.startDate ?? ""}
            />
          </div>
        </CardContent>
      </Card>

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
              : "Create Project"}
        </Button>
      </div>
    </form>
  );
}

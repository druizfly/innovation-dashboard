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
import {
  createTechRadarItem,
  updateTechRadarItem,
} from "@/app/tech-radar/actions";

const CATEGORIES = [
  { value: "adopt", label: "Adopt" },
  { value: "explore", label: "Explore" },
  { value: "consolidate", label: "Consolidate" },
  { value: "avoid", label: "Avoid" },
] as const;

const QUADRANTS = [
  { value: "languages-frameworks", label: "Languages & Frameworks" },
  { value: "tools", label: "Tools" },
  { value: "platforms", label: "Platforms" },
  { value: "techniques", label: "Techniques" },
] as const;

interface TechRadarFormProps {
  item?: {
    id: number;
    technologyName: string;
    category: string;
    quadrant: string;
    description: string | null;
    rationale: string | null;
    url: string | null;
    updatedAt: Date;
  };
}

type FormState = { error?: string; success?: boolean } | null;

export function TechRadarForm({ item }: TechRadarFormProps) {
  const router = useRouter();
  const isEditing = !!item;

  async function formAction(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    if (isEditing) {
      formData.set("expectedUpdatedAt", item!.updatedAt.toISOString());
      const result = await updateTechRadarItem(item!.id, formData);
      if (result.success) {
        router.push("/tech-radar");
        return { success: true };
      }
      return { error: result.error };
    } else {
      const result = await createTechRadarItem(formData);
      if (result.success) {
        router.push("/tech-radar");
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
          <CardTitle>Technology Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="technologyName">Technology Name *</Label>
            <Input
              id="technologyName"
              name="technologyName"
              required
              maxLength={255}
              defaultValue={item?.technologyName ?? ""}
              placeholder="e.g., React Server Components"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              name="category"
              defaultValue={item?.category ?? ""}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quadrant">Quadrant *</Label>
            <Select
              name="quadrant"
              defaultValue={item?.quadrant ?? ""}
              required
            >
              <SelectTrigger id="quadrant">
                <SelectValue placeholder="Select quadrant" />
              </SelectTrigger>
              <SelectContent>
                {QUADRANTS.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={item?.description ?? ""}
              placeholder="Describe the technology, its purpose, and how it fits into the stack..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rationale">Rationale</Label>
            <Textarea
              id="rationale"
              name="rationale"
              rows={4}
              defaultValue={item?.rationale ?? ""}
              placeholder="Why is this technology in this category? What are the key factors behind this decision?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              maxLength={500}
              defaultValue={item?.url ?? ""}
              placeholder="https://example.com/docs"
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
              : "Create Item"}
        </Button>
      </div>
    </form>
  );
}

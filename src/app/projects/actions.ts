"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, projectDuplications } from "@/lib/db/schema";
import { createProjectSchema, updateProjectSchema } from "@/lib/validations/project";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActionSuccess = { success: true; id: number };
type ActionError = { success: false; error: string };
type ActionResult = ActionSuccess | ActionError;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts FormData into a plain object suitable for Zod validation.
 *
 * - Empty strings are converted to `undefined` so optional Zod fields
 *   do not receive a value that fails validation (e.g. `.email()`).
 * - The `metadata` field is JSON-parsed when present and non-empty.
 */
function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // FormData values can be File objects; skip any file entries.
    if (typeof value !== "string") continue;

    if (key === "metadata") {
      if (value.trim() !== "") {
        try {
          data[key] = JSON.parse(value);
        } catch {
          // Let Zod catch the invalid JSON as a validation error
          data[key] = value;
        }
      }
      continue;
    }

    // Convert empty strings to undefined so optional fields stay omitted.
    data[key] = value === "" ? undefined : value;
  }

  return data;
}

function formatZodError(error: { issues: Array<{ path: PropertyKey[]; message: string }> }): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createProject(formData: FormData): Promise<ActionResult> {
  const raw = parseFormData(formData);

  // Hardcode author fields until auth is available.
  raw.createdBy = "system";
  raw.updatedBy = "system";

  const parsed = createProjectSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const [inserted] = await db
      .insert(projects)
      .values({
        name: parsed.data.name,
        description: parsed.data.description,
        department: parsed.data.department,
        leaderName: parsed.data.leaderName,
        leaderEmail: parsed.data.leaderEmail,
        status: parsed.data.status,
        decision: parsed.data.decision,
        decisionDate: parsed.data.decisionDate,
        decisionNotes: parsed.data.decisionNotes,
        startDate: parsed.data.startDate,
        metadata: parsed.data.metadata,
        createdBy: parsed.data.createdBy,
        updatedBy: parsed.data.updatedBy,
      })
      .returning({ id: projects.id });

    revalidatePath("/projects");

    return { success: true, id: inserted.id };
  } catch (error) {
    console.error("createProject failed:", error);
    return {
      success: false,
      error: "Failed to create project. Please try again.",
    };
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateProject(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const raw = parseFormData(formData);

  // Hardcode updatedBy until auth is available.
  raw.updatedBy = "system";

  const parsed = updateProjectSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  // ── Optimistic concurrency check ──────────────────────────────────────
  const expectedUpdatedAt = formData.get("expectedUpdatedAt");

  if (typeof expectedUpdatedAt !== "string" || expectedUpdatedAt === "") {
    return {
      success: false,
      error: "expectedUpdatedAt is required for optimistic concurrency.",
    };
  }

  const expectedTimestamp = new Date(expectedUpdatedAt);

  if (Number.isNaN(expectedTimestamp.getTime())) {
    return {
      success: false,
      error: "expectedUpdatedAt must be a valid ISO date string.",
    };
  }

  try {
    const now = new Date();

    const [updated] = await db
      .update(projects)
      .set({
        ...parsed.data,
        updatedAt: now,
      })
      .where(
        and(
          eq(projects.id, id),
          eq(projects.updatedAt, expectedTimestamp),
        ),
      )
      .returning({ id: projects.id });

    if (!updated) {
      return {
        success: false,
        error:
          "Update conflict: the project was modified by another user. Please refresh and try again.",
      };
    }

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return { success: true, id: updated.id };
  } catch (error) {
    console.error("updateProject failed:", error);
    return {
      success: false,
      error: "Failed to update project. Please try again.",
    };
  }
}

// ─── Delete (soft) ──────────────────────────────────────────────────────────

export async function deleteProject(id: number): Promise<ActionResult> {
  try {
    const now = new Date();

    const [deleted] = await db
      .update(projects)
      .set({
        deletedAt: now,
        updatedBy: "system",
        updatedAt: now,
      })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });

    if (!deleted) {
      return { success: false, error: "Project not found." };
    }

    revalidatePath("/projects");

    return { success: true, id: deleted.id };
  } catch (error) {
    console.error("deleteProject failed:", error);
    return {
      success: false,
      error: "Failed to delete project. Please try again.",
    };
  }
}

// ─── Flag Duplication ───────────────────────────────────────────────────────

export async function flagDuplication(
  projectId: number,
  relatedProjectId: number,
  notes?: string,
): Promise<ActionResult> {
  if (projectId === relatedProjectId) {
    return {
      success: false,
      error: "A project cannot be flagged as a duplicate of itself.",
    };
  }

  try {
    const [inserted] = await db
      .insert(projectDuplications)
      .values({
        projectId,
        relatedProjectId,
        flaggedBy: "system",
        notes: notes ?? null,
      })
      .returning({ id: projectDuplications.id });

    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/projects/${relatedProjectId}`);

    return { success: true, id: inserted.id };
  } catch (error) {
    // Handle unique constraint violation (duplicate flag already exists).
    if (
      error instanceof Error &&
      error.message.includes("unique")
    ) {
      return {
        success: false,
        error: "This duplication has already been flagged.",
      };
    }

    console.error("flagDuplication failed:", error);
    return {
      success: false,
      error: "Failed to flag duplication. Please try again.",
    };
  }
}

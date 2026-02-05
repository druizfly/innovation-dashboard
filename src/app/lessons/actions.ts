"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  lessonsLearned,
  lessonTags,
  lessonProjects,
  tags,
} from "@/lib/db/schema";
import {
  createLessonSchema,
  updateLessonSchema,
} from "@/lib/validations/lesson";

// ─── Types ──────────────────────────────────────────────────────────────────

type ActionSuccess = { success: true; id: number };
type ActionError = { success: false; error: string };
type ActionResult = ActionSuccess | ActionError;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts FormData into a plain object suitable for Zod validation.
 *
 * - Empty strings are converted to `undefined` so optional Zod fields
 *   do not receive a value that fails validation.
 * - The `tags` and `relatedProjects` fields are kept as strings for
 *   special parsing downstream.
 */
function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // FormData values can be File objects; skip any file entries.
    if (typeof value !== "string") continue;

    // Skip checkbox field — handled separately via getAll().
    if (key === "relatedProjectIds") continue;

    // Keep tags as a raw string for special handling.
    if (key === "tags") {
      data[key] = value;
      continue;
    }

    // Convert empty strings to undefined so optional fields stay omitted.
    data[key] = value === "" ? undefined : value;
  }

  return data;
}

function formatZodError(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

/**
 * Parses a comma-separated string of tag names, trims whitespace,
 * and removes empty entries.
 */
function parseTagNames(raw: unknown): string[] {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Finds or creates tags by name, returning their IDs.
 *
 * Uses INSERT ... ON CONFLICT (name) DO NOTHING for each tag,
 * then queries for any that already existed (empty returning result).
 */
async function findOrCreateTags(tagNames: string[]): Promise<number[]> {
  if (tagNames.length === 0) return [];

  const tagIds: number[] = [];

  for (const name of tagNames) {
    const [inserted] = await db
      .insert(tags)
      .values({ name })
      .onConflictDoNothing()
      .returning({ id: tags.id });

    if (inserted) {
      tagIds.push(inserted.id);
    } else {
      // Tag already exists; query for its ID.
      const [existing] = await db
        .select({ id: tags.id })
        .from(tags)
        .where(eq(tags.name, name));

      if (existing) {
        tagIds.push(existing.id);
      }
    }
  }

  return tagIds;
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createLesson(
  formData: FormData,
): Promise<ActionResult> {
  const raw = parseFormData(formData);

  // Hardcode updatedBy until auth is available.
  raw.updatedBy = "system";

  // Extract junction data before validation (not part of the lesson schema).
  const tagNames = parseTagNames(raw.tags);
  const projectIds = formData
    .getAll("relatedProjectIds")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n) && n > 0);
  delete raw.tags;

  const parsed = createLessonSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const [inserted] = await db
      .insert(lessonsLearned)
      .values({
        title: parsed.data.title,
        content: parsed.data.content,
        author: parsed.data.author,
        updatedBy: parsed.data.updatedBy,
      })
      .returning({ id: lessonsLearned.id });

    const lessonId = inserted.id;

    // Handle tags: find or create, then insert junction rows.
    const tagIds = await findOrCreateTags(tagNames);

    if (tagIds.length > 0) {
      await db.insert(lessonTags).values(
        tagIds.map((tagId) => ({ lessonId, tagId })),
      );
    }

    // Handle related projects: insert junction rows.
    if (projectIds.length > 0) {
      await db.insert(lessonProjects).values(
        projectIds.map((projectId) => ({ lessonId, projectId })),
      );
    }

    revalidatePath("/lessons");

    return { success: true, id: lessonId };
  } catch (error) {
    console.error("createLesson failed:", error);
    return {
      success: false,
      error: "Failed to create lesson. Please try again.",
    };
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateLesson(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const raw = parseFormData(formData);

  // Hardcode updatedBy until auth is available.
  raw.updatedBy = "system";

  // Extract junction data before validation.
  const tagNames = parseTagNames(raw.tags);
  const projectIds = formData
    .getAll("relatedProjectIds")
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n) && n > 0);
  delete raw.tags;

  const parsed = updateLessonSchema.safeParse(raw);

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
      .update(lessonsLearned)
      .set({
        ...parsed.data,
        updatedAt: now,
      })
      .where(
        and(
          eq(lessonsLearned.id, id),
          eq(lessonsLearned.updatedAt, expectedTimestamp),
        ),
      )
      .returning({ id: lessonsLearned.id });

    if (!updated) {
      return {
        success: false,
        error:
          "Update conflict: the lesson was modified by another user. Please refresh and try again.",
      };
    }

    // Replace tags: delete existing, then insert new ones.
    await db.delete(lessonTags).where(eq(lessonTags.lessonId, id));

    const tagIds = await findOrCreateTags(tagNames);

    if (tagIds.length > 0) {
      await db.insert(lessonTags).values(
        tagIds.map((tagId) => ({ lessonId: id, tagId })),
      );
    }

    // Replace related projects: delete existing, then insert new ones.
    await db.delete(lessonProjects).where(eq(lessonProjects.lessonId, id));

    if (projectIds.length > 0) {
      await db.insert(lessonProjects).values(
        projectIds.map((projectId) => ({ lessonId: id, projectId })),
      );
    }

    revalidatePath("/lessons");
    revalidatePath(`/lessons/${id}`);

    return { success: true, id: updated.id };
  } catch (error) {
    console.error("updateLesson failed:", error);
    return {
      success: false,
      error: "Failed to update lesson. Please try again.",
    };
  }
}

// ─── Delete (soft) ──────────────────────────────────────────────────────────

export async function deleteLesson(id: number): Promise<ActionResult> {
  try {
    const now = new Date();

    const [deleted] = await db
      .update(lessonsLearned)
      .set({
        deletedAt: now,
        updatedBy: "system",
        updatedAt: now,
      })
      .where(eq(lessonsLearned.id, id))
      .returning({ id: lessonsLearned.id });

    if (!deleted) {
      return { success: false, error: "Lesson not found." };
    }

    revalidatePath("/lessons");

    return { success: true, id: deleted.id };
  } catch (error) {
    console.error("deleteLesson failed:", error);
    return {
      success: false,
      error: "Failed to delete lesson. Please try again.",
    };
  }
}

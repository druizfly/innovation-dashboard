"use server";

import { revalidatePath } from "next/cache";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { techRadar } from "@/lib/db/schema";
import {
  createTechRadarSchema,
  updateTechRadarSchema,
} from "@/lib/validations/tech-radar";
import { requireAdmin } from "@/lib/auth";

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
 */
function parseFormData(formData: FormData): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    // FormData values can be File objects; skip any file entries.
    if (typeof value !== "string") continue;

    // Convert empty strings to undefined so optional fields stay omitted.
    data[key] = value === "" ? undefined : value;
  }

  return data;
}

function formatZodError(
  error: { issues: Array<{ path: PropertyKey[]; message: string }> },
): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

// ─── Create ─────────────────────────────────────────────────────────────────

export async function createTechRadarItem(
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = parseFormData(formData);

  // Hardcode author fields until auth is available.
  raw.createdBy = "system";
  raw.updatedBy = "system";

  const parsed = createTechRadarSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  try {
    const [inserted] = await db
      .insert(techRadar)
      .values({
        technologyName: parsed.data.technologyName,
        category: parsed.data.category,
        quadrant: parsed.data.quadrant,
        description: parsed.data.description,
        rationale: parsed.data.rationale,
        url: parsed.data.url,
        createdBy: parsed.data.createdBy,
        updatedBy: parsed.data.updatedBy,
      })
      .returning({ id: techRadar.id });

    revalidatePath("/tech-radar");

    return { success: true, id: inserted.id };
  } catch (error) {
    console.error("createTechRadarItem failed:", error);
    return {
      success: false,
      error: "Failed to create tech radar item. Please try again.",
    };
  }
}

// ─── Update ─────────────────────────────────────────────────────────────────

export async function updateTechRadarItem(
  id: number,
  formData: FormData,
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  const raw = parseFormData(formData);

  // Hardcode updatedBy until auth is available.
  raw.updatedBy = "system";

  const parsed = updateTechRadarSchema.safeParse(raw);

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

  try {
    const now = new Date();

    const [updated] = await db
      .update(techRadar)
      .set({
        ...parsed.data,
        updatedAt: now,
      })
      .where(
        and(
          eq(techRadar.id, id),
          sql`date_trunc('milliseconds', ${techRadar.updatedAt}) = date_trunc('milliseconds', ${expectedUpdatedAt}::timestamp)`,
        ),
      )
      .returning({ id: techRadar.id });

    if (!updated) {
      return {
        success: false,
        error:
          "Update conflict: the tech radar item was modified by another user. Please refresh and try again.",
      };
    }

    revalidatePath("/tech-radar");
    revalidatePath(`/tech-radar/${id}`);

    return { success: true, id: updated.id };
  } catch (error) {
    console.error("updateTechRadarItem failed:", error);
    return {
      success: false,
      error: "Failed to update tech radar item. Please try again.",
    };
  }
}

// ─── Delete (soft) ──────────────────────────────────────────────────────────

export async function deleteTechRadarItem(
  id: number,
): Promise<ActionResult> {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const now = new Date();

    const [deleted] = await db
      .update(techRadar)
      .set({
        deletedAt: now,
        updatedBy: "system",
        updatedAt: now,
      })
      .where(eq(techRadar.id, id))
      .returning({ id: techRadar.id });

    if (!deleted) {
      return { success: false, error: "Tech radar item not found." };
    }

    revalidatePath("/tech-radar");

    return { success: true, id: deleted.id };
  } catch (error) {
    console.error("deleteTechRadarItem failed:", error);
    return {
      success: false,
      error: "Failed to delete tech radar item. Please try again.",
    };
  }
}

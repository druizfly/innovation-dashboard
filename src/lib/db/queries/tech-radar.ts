import { sql, eq, and, isNull, asc, count, SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { techRadar } from "@/lib/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

type TechRadarItem = typeof techRadar.$inferSelect;

export interface TechRadarFilters {
  search?: string;
  category?: string;
  quadrant?: string;
}

export interface TechRadarCategoryGroup {
  category: string;
  items: TechRadarItem[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

/** Fixed display order for tech radar categories. */
const CATEGORY_ORDER = ["adopt", "explore", "consolidate", "avoid"] as const;

// ─── getTechRadarItems ──────────────────────────────────────────────────────

export async function getTechRadarItems(
  filters: TechRadarFilters = {},
): Promise<TechRadarItem[]> {
  const { search, category, quadrant } = filters;

  const conditions: SQL[] = [isNull(techRadar.deletedAt)];

  if (category) {
    conditions.push(eq(techRadar.category, category));
  }

  if (quadrant) {
    conditions.push(eq(techRadar.quadrant, quadrant));
  }

  if (search) {
    conditions.push(
      sql`search_vector @@ plainto_tsquery('english', ${search})`,
    );
  }

  const whereClause = and(...conditions);

  // Order by category in the fixed priority (adopt, explore, consolidate, avoid),
  // then alphabetically by technology name within each category.
  const categoryOrderExpr = sql`
    CASE ${techRadar.category}
      WHEN 'adopt' THEN 0
      WHEN 'explore' THEN 1
      WHEN 'consolidate' THEN 2
      WHEN 'avoid' THEN 3
      ELSE 4
    END
  `;

  const rows = await db
    .select()
    .from(techRadar)
    .where(whereClause)
    .orderBy(categoryOrderExpr, asc(techRadar.technologyName));

  return rows;
}

// ─── getTechRadarItemById ───────────────────────────────────────────────────

export async function getTechRadarItemById(
  id: number,
): Promise<TechRadarItem | null> {
  const item = await db.query.techRadar.findFirst({
    where: and(eq(techRadar.id, id), isNull(techRadar.deletedAt)),
  });

  return item ?? null;
}

// ─── getTechRadarGroupedByCategory ──────────────────────────────────────────

export async function getTechRadarGroupedByCategory(
  search?: string,
): Promise<TechRadarCategoryGroup[]> {
  const items = await getTechRadarItems({ search });

  // Group items by category, preserving the fixed order.
  const groupMap = new Map<string, TechRadarItem[]>();

  for (const item of items) {
    const existing = groupMap.get(item.category);
    if (existing) {
      existing.push(item);
    } else {
      groupMap.set(item.category, [item]);
    }
  }

  // Build result in the canonical category order, skipping empty groups.
  const groups: TechRadarCategoryGroup[] = [];

  for (const category of CATEGORY_ORDER) {
    const categoryItems = groupMap.get(category);
    if (categoryItems && categoryItems.length > 0) {
      groups.push({ category, items: categoryItems });
    }
  }

  return groups;
}

// ─── getTechRadarForRadarView ────────────────────────────────────────────────

const QUADRANT_ORDER = ["languages-frameworks", "tools", "platforms", "techniques"] as const;
const RING_ORDER = ["adopt", "explore", "consolidate", "avoid"] as const;

export async function getTechRadarForRadarView(
  search?: string,
): Promise<TechRadarItem[]> {
  const items = await getTechRadarItems({ search });

  return items.sort((a, b) => {
    const qA = QUADRANT_ORDER.indexOf(a.quadrant as typeof QUADRANT_ORDER[number]);
    const qB = QUADRANT_ORDER.indexOf(b.quadrant as typeof QUADRANT_ORDER[number]);
    if (qA !== qB) return qA - qB;
    const rA = RING_ORDER.indexOf(a.category as typeof RING_ORDER[number]);
    const rB = RING_ORDER.indexOf(b.category as typeof RING_ORDER[number]);
    return rA - rB;
  });
}

// ─── getTechRadarStats ──────────────────────────────────────────────────────

export async function getTechRadarStats(): Promise<Record<string, number>> {
  const rows = await db
    .select({
      category: techRadar.category,
      count: count(),
    })
    .from(techRadar)
    .where(isNull(techRadar.deletedAt))
    .groupBy(techRadar.category);

  const stats: Record<string, number> = {};

  for (const row of rows) {
    stats[row.category] = row.count;
  }

  return stats;
}

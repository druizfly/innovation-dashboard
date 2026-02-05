import { sql, eq, and, isNull, desc, asc, count, SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  projects,
  projectMilestones,
  projectDuplications,
  projectTags,
  tags,
} from "@/lib/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

type Project = typeof projects.$inferSelect;

export interface ProjectFilters {
  search?: string;
  department?: string;
  status?: string;
  decision?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProjectWithAggregates extends Project {
  duplicationsCount: number;
  tags: string[];
}

export interface ProjectListResult {
  projects: ProjectWithAggregates[];
  totalCount: number;
}

export interface ProjectDetail extends Project {
  milestones: (typeof projectMilestones.$inferSelect)[];
  duplications: (typeof projectDuplications.$inferSelect & {
    relatedProjectName: string;
  })[];
  tags: { id: number; name: string }[];
}

export interface ProjectStats {
  byStatus: Record<string, number>;
  byDecision: Record<string, number>;
  total: number;
}

// ─── Allowed sort columns ───────────────────────────────────────────────────

const SORTABLE_COLUMNS: Record<
  string,
  (typeof projects.$inferSelect extends infer T
    ? { [K in keyof T]: (typeof projects)[K & keyof typeof projects] }
    : never)[keyof Project & keyof typeof projects]
> = {
  name: projects.name,
  department: projects.department,
  status: projects.status,
  decision: projects.decision,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  startDate: projects.startDate,
  leaderName: projects.leaderName,
};

// ─── getProjects ────────────────────────────────────────────────────────────

export async function getProjects(
  filters: ProjectFilters = {},
): Promise<ProjectListResult> {
  const {
    search,
    department,
    status,
    decision,
    page = 1,
    pageSize = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Build WHERE conditions
  const conditions: SQL[] = [isNull(projects.deletedAt)];

  if (search) {
    conditions.push(
      sql`search_vector @@ plainto_tsquery('english', ${search})`,
    );
  }

  if (department) {
    conditions.push(eq(projects.department, department));
  }

  if (status) {
    conditions.push(eq(projects.status, status));
  }

  if (decision) {
    conditions.push(eq(projects.decision, decision));
  }

  const whereClause = and(...conditions);

  // Build ORDER BY clause
  let orderByClause: SQL;

  if (search) {
    // When searching, default to relevance ordering unless a specific column is requested
    if (sortBy === "createdAt" && sortOrder === "desc") {
      orderByClause = sql`ts_rank(search_vector, plainto_tsquery('english', ${search})) DESC`;
    } else {
      const column = SORTABLE_COLUMNS[sortBy] ?? projects.createdAt;
      orderByClause =
        sortOrder === "asc" ? asc(column) : desc(column);
    }
  } else {
    const column = SORTABLE_COLUMNS[sortBy] ?? projects.createdAt;
    orderByClause =
      sortOrder === "asc" ? asc(column) : desc(column);
  }

  const offset = (page - 1) * pageSize;

  // Execute total count and paginated query in parallel
  const [countResult, projectRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(projects)
      .where(whereClause),

    db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        department: projects.department,
        leaderName: projects.leaderName,
        leaderEmail: projects.leaderEmail,
        status: projects.status,
        decision: projects.decision,
        decisionDate: projects.decisionDate,
        decisionNotes: projects.decisionNotes,
        startDate: projects.startDate,
        metadata: projects.metadata,
        createdAt: projects.createdAt,
        createdBy: projects.createdBy,
        updatedAt: projects.updatedAt,
        updatedBy: projects.updatedBy,
        deletedAt: projects.deletedAt,
      })
      .from(projects)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  if (projectRows.length === 0) {
    return { projects: [], totalCount };
  }

  // Batch-load duplications counts and tags for the page of results
  const projectIds = projectRows.map((p) => p.id);

  const [duplicationsCountRows, tagRows] = await Promise.all([
    db
      .select({
        projectId: projectDuplications.projectId,
        count: count(),
      })
      .from(projectDuplications)
      .where(
        sql`${projectDuplications.projectId} IN ${projectIds}`,
      )
      .groupBy(projectDuplications.projectId),

    db
      .select({
        projectId: projectTags.projectId,
        tagName: tags.name,
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(sql`${projectTags.projectId} IN ${projectIds}`),
  ]);

  // Index lookup maps
  const duplicationsMap = new Map<number, number>();
  for (const row of duplicationsCountRows) {
    duplicationsMap.set(row.projectId, row.count);
  }

  const tagsMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const existing = tagsMap.get(row.projectId);
    if (existing) {
      existing.push(row.tagName);
    } else {
      tagsMap.set(row.projectId, [row.tagName]);
    }
  }

  // Assemble final results
  const enrichedProjects: ProjectWithAggregates[] = projectRows.map(
    (project) => ({
      ...project,
      duplicationsCount: duplicationsMap.get(project.id) ?? 0,
      tags: tagsMap.get(project.id) ?? [],
    }),
  );

  return { projects: enrichedProjects, totalCount };
}

// ─── getProjectById ─────────────────────────────────────────────────────────

export async function getProjectById(
  id: number,
): Promise<ProjectDetail | null> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), isNull(projects.deletedAt)),
  });

  if (!project) {
    return null;
  }

  const [milestoneRows, duplicationRows, tagRows] = await Promise.all([
    db
      .select()
      .from(projectMilestones)
      .where(eq(projectMilestones.projectId, id))
      .orderBy(asc(projectMilestones.targetDate)),

    db
      .select({
        id: projectDuplications.id,
        projectId: projectDuplications.projectId,
        relatedProjectId: projectDuplications.relatedProjectId,
        flaggedBy: projectDuplications.flaggedBy,
        flaggedAt: projectDuplications.flaggedAt,
        notes: projectDuplications.notes,
        similarityScore: projectDuplications.similarityScore,
        relatedProjectName: projects.name,
      })
      .from(projectDuplications)
      .innerJoin(
        projects,
        eq(projectDuplications.relatedProjectId, projects.id),
      )
      .where(eq(projectDuplications.projectId, id)),

    db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(projectTags)
      .innerJoin(tags, eq(projectTags.tagId, tags.id))
      .where(eq(projectTags.projectId, id)),
  ]);

  return {
    ...project,
    milestones: milestoneRows,
    duplications: duplicationRows,
    tags: tagRows,
  };
}

// ─── getDepartments ─────────────────────────────────────────────────────────

export async function getDepartments(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ department: projects.department })
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(asc(projects.department));

  return rows.map((r) => r.department);
}

// ─── getProjectStats ────────────────────────────────────────────────────────

export async function getProjectStats(): Promise<ProjectStats> {
  const [statusRows, decisionRows, totalRow] = await Promise.all([
    db
      .select({
        status: projects.status,
        count: count(),
      })
      .from(projects)
      .where(isNull(projects.deletedAt))
      .groupBy(projects.status),

    db
      .select({
        decision: projects.decision,
        count: count(),
      })
      .from(projects)
      .where(and(isNull(projects.deletedAt), sql`${projects.decision} IS NOT NULL`))
      .groupBy(projects.decision),

    db
      .select({ count: count() })
      .from(projects)
      .where(isNull(projects.deletedAt)),
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
  }

  const byDecision: Record<string, number> = {};
  for (const row of decisionRows) {
    if (row.decision) {
      byDecision[row.decision] = row.count;
    }
  }

  return {
    byStatus,
    byDecision,
    total: totalRow[0]?.count ?? 0,
  };
}

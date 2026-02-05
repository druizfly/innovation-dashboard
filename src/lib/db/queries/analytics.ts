import {
  sql,
  and,
  isNull,
  desc,
  count,
  countDistinct,
} from "drizzle-orm";

import { db } from "@/lib/db";
import {
  projects,
  projectDuplications,
  techRadar,
  lessonsLearned,
} from "@/lib/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DepartmentCount {
  department: string;
  count: number;
}

export interface StatusByDepartment {
  department: string;
  idea: number;
  development: number;
  pilot: number;
}

export interface DecisionCount {
  decision: string;
  count: number;
}

export interface DuplicationStats {
  totalFlagged: number;
  topDuplicated: {
    projectId: number;
    projectName: string;
    count: number;
  }[];
}

export interface TimelineEntry {
  month: string;
  created: number;
}

export interface OverviewStats {
  totalProjects: number;
  totalDepartments: number;
  totalDuplications: number;
  pendingDecisions: number;
  techRadarItems: number;
  lessonsLearned: number;
}

// ─── Active projects filter ─────────────────────────────────────────────────

const activeProjects = isNull(projects.deletedAt);

// ─── getProjectsByDepartment ────────────────────────────────────────────────

export async function getProjectsByDepartment(): Promise<DepartmentCount[]> {
  const rows = await db
    .select({
      department: projects.department,
      count: count(),
    })
    .from(projects)
    .where(activeProjects)
    .groupBy(projects.department)
    .orderBy(desc(count()));

  return rows;
}

// ─── getProjectsByStatusAndDepartment ───────────────────────────────────────

export async function getProjectsByStatusAndDepartment(): Promise<
  StatusByDepartment[]
> {
  const rows = await db
    .select({
      department: projects.department,
      idea: count(
        sql`CASE WHEN ${projects.status} = 'idea' THEN 1 END`,
      ),
      development: count(
        sql`CASE WHEN ${projects.status} = 'development' THEN 1 END`,
      ),
      pilot: count(
        sql`CASE WHEN ${projects.status} = 'pilot' THEN 1 END`,
      ),
      total: count(),
    })
    .from(projects)
    .where(activeProjects)
    .groupBy(projects.department)
    .orderBy(desc(count()));

  return rows.map(({ department, idea, development, pilot }) => ({
    department,
    idea,
    development,
    pilot,
  }));
}

// ─── getDecisionBreakdown ───────────────────────────────────────────────────

export async function getDecisionBreakdown(): Promise<DecisionCount[]> {
  const rows = await db
    .select({
      decision: sql<string>`COALESCE(${projects.decision}, 'pending')`,
      count: count(),
    })
    .from(projects)
    .where(activeProjects)
    .groupBy(sql`COALESCE(${projects.decision}, 'pending')`);

  // Enforce a fixed display order
  const ORDER: Record<string, number> = {
    advance: 0,
    consolidate: 1,
    pause: 2,
    pending: 3,
  };

  return rows.sort(
    (a, b) => (ORDER[a.decision] ?? 99) - (ORDER[b.decision] ?? 99),
  );
}

// ─── getDuplicationStats ────────────────────────────────────────────────────

export async function getDuplicationStats(): Promise<DuplicationStats> {
  const [totalRow, topRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(projectDuplications),

    db
      .select({
        projectId: projectDuplications.projectId,
        projectName: projects.name,
        count: count(),
      })
      .from(projectDuplications)
      .innerJoin(projects, sql`${projectDuplications.projectId} = ${projects.id}`)
      .groupBy(projectDuplications.projectId, projects.name)
      .orderBy(desc(count()))
      .limit(5),
  ]);

  return {
    totalFlagged: totalRow[0]?.count ?? 0,
    topDuplicated: topRows,
  };
}

// ─── getProjectTimeline ─────────────────────────────────────────────────────

export async function getProjectTimeline(): Promise<TimelineEntry[]> {
  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${projects.createdAt}), 'Mon YYYY')`,
      monthSort: sql<Date>`date_trunc('month', ${projects.createdAt})`,
      created: count(),
    })
    .from(projects)
    .where(
      and(
        activeProjects,
        sql`${projects.createdAt} >= date_trunc('month', now()) - interval '11 months'`,
      ),
    )
    .groupBy(
      sql`date_trunc('month', ${projects.createdAt})`,
    )
    .orderBy(sql`date_trunc('month', ${projects.createdAt})`);

  return rows.map(({ month, created }) => ({ month, created }));
}

// ─── getOverviewStats ───────────────────────────────────────────────────────

export async function getOverviewStats(): Promise<OverviewStats> {
  const [
    projectCountRow,
    departmentCountRow,
    duplicationCountRow,
    pendingRow,
    techRadarRow,
    lessonsRow,
  ] = await Promise.all([
    db
      .select({ count: count() })
      .from(projects)
      .where(activeProjects),

    db
      .select({ count: countDistinct(projects.department) })
      .from(projects)
      .where(activeProjects),

    db
      .select({ count: count() })
      .from(projectDuplications),

    db
      .select({ count: count() })
      .from(projects)
      .where(and(activeProjects, isNull(projects.decision))),

    db
      .select({ count: count() })
      .from(techRadar)
      .where(isNull(techRadar.deletedAt)),

    db
      .select({ count: count() })
      .from(lessonsLearned)
      .where(isNull(lessonsLearned.deletedAt)),
  ]);

  return {
    totalProjects: projectCountRow[0]?.count ?? 0,
    totalDepartments: departmentCountRow[0]?.count ?? 0,
    totalDuplications: duplicationCountRow[0]?.count ?? 0,
    pendingDecisions: pendingRow[0]?.count ?? 0,
    techRadarItems: techRadarRow[0]?.count ?? 0,
    lessonsLearned: lessonsRow[0]?.count ?? 0,
  };
}

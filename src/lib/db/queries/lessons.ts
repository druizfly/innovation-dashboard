import { sql, eq, and, isNull, desc, asc, count, SQL, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  lessonsLearned,
  lessonProjects,
  lessonTags,
  tags,
  projects,
} from "@/lib/db/schema";

// ─── Types ──────────────────────────────────────────────────────────────────

type Lesson = typeof lessonsLearned.$inferSelect;

export interface LessonFilters {
  search?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface LessonWithMeta extends Lesson {
  tags: string[];
  relatedProjects: { id: number; name: string }[];
}

export interface LessonListResult {
  lessons: LessonWithMeta[];
  totalCount: number;
}

export interface LessonDetail extends Lesson {
  tags: string[];
  relatedProjects: { id: number; name: string }[];
}

export interface LessonStats {
  total: number;
  byTag: { tag: string; count: number }[];
}

// ─── getLessons ─────────────────────────────────────────────────────────────

export async function getLessons(
  filters: LessonFilters = {},
): Promise<LessonListResult> {
  const { search, tag, page = 1, pageSize = 20 } = filters;

  // Build WHERE conditions
  const conditions: SQL[] = [isNull(lessonsLearned.deletedAt)];

  if (search) {
    conditions.push(
      sql`search_vector @@ plainto_tsquery('english', ${search})`,
    );
  }

  // When filtering by tag, we need to narrow to lessons that have the tag.
  // We collect matching lesson IDs first so the main query stays clean.
  let tagFilteredLessonIds: number[] | null = null;

  if (tag) {
    const matchingRows = await db
      .select({ lessonId: lessonTags.lessonId })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .where(eq(tags.name, tag));

    tagFilteredLessonIds = matchingRows.map((r) => r.lessonId);

    if (tagFilteredLessonIds.length === 0) {
      return { lessons: [], totalCount: 0 };
    }

    conditions.push(inArray(lessonsLearned.id, tagFilteredLessonIds));
  }

  const whereClause = and(...conditions);

  // Build ORDER BY clause
  let orderByClause: SQL;

  if (search) {
    orderByClause = sql`ts_rank(search_vector, plainto_tsquery('english', ${search})) DESC`;
  } else {
    orderByClause = desc(lessonsLearned.createdAt);
  }

  const offset = (page - 1) * pageSize;

  // Execute total count and paginated query in parallel
  const [countResult, lessonRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(lessonsLearned)
      .where(whereClause),

    db
      .select({
        id: lessonsLearned.id,
        title: lessonsLearned.title,
        content: lessonsLearned.content,
        author: lessonsLearned.author,
        createdAt: lessonsLearned.createdAt,
        updatedAt: lessonsLearned.updatedAt,
        updatedBy: lessonsLearned.updatedBy,
        deletedAt: lessonsLearned.deletedAt,
      })
      .from(lessonsLearned)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset),
  ]);

  const totalCount = countResult[0]?.count ?? 0;

  if (lessonRows.length === 0) {
    return { lessons: [], totalCount };
  }

  // Batch-load tags and relatedProjects for the page of results (avoid N+1)
  const lessonIds = lessonRows.map((l) => l.id);

  const [tagRows, projectRows] = await Promise.all([
    db
      .select({
        lessonId: lessonTags.lessonId,
        tagName: tags.name,
      })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .where(sql`${lessonTags.lessonId} IN ${lessonIds}`),

    db
      .select({
        lessonId: lessonProjects.lessonId,
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(lessonProjects)
      .innerJoin(projects, eq(lessonProjects.projectId, projects.id))
      .where(sql`${lessonProjects.lessonId} IN ${lessonIds}`),
  ]);

  // Index lookup maps
  const tagsMap = new Map<number, string[]>();
  for (const row of tagRows) {
    const existing = tagsMap.get(row.lessonId);
    if (existing) {
      existing.push(row.tagName);
    } else {
      tagsMap.set(row.lessonId, [row.tagName]);
    }
  }

  const projectsMap = new Map<number, { id: number; name: string }[]>();
  for (const row of projectRows) {
    const entry = { id: row.projectId, name: row.projectName };
    const existing = projectsMap.get(row.lessonId);
    if (existing) {
      existing.push(entry);
    } else {
      projectsMap.set(row.lessonId, [entry]);
    }
  }

  // Assemble final results
  const enrichedLessons: LessonWithMeta[] = lessonRows.map((lesson) => ({
    ...lesson,
    tags: tagsMap.get(lesson.id) ?? [],
    relatedProjects: projectsMap.get(lesson.id) ?? [],
  }));

  return { lessons: enrichedLessons, totalCount };
}

// ─── getLessonById ──────────────────────────────────────────────────────────

export async function getLessonById(
  id: number,
): Promise<LessonDetail | null> {
  const lesson = await db.query.lessonsLearned.findFirst({
    where: and(eq(lessonsLearned.id, id), isNull(lessonsLearned.deletedAt)),
  });

  if (!lesson) {
    return null;
  }

  const [tagRows, projectRows] = await Promise.all([
    db
      .select({
        tagName: tags.name,
      })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .where(eq(lessonTags.lessonId, id)),

    db
      .select({
        projectId: projects.id,
        projectName: projects.name,
      })
      .from(lessonProjects)
      .innerJoin(projects, eq(lessonProjects.projectId, projects.id))
      .where(eq(lessonProjects.lessonId, id)),
  ]);

  return {
    ...lesson,
    tags: tagRows.map((r) => r.tagName),
    relatedProjects: projectRows.map((r) => ({
      id: r.projectId,
      name: r.projectName,
    })),
  };
}

// ─── getAllTags ──────────────────────────────────────────────────────────────

export async function getAllTags(): Promise<{ id: number; name: string }[]> {
  const rows = await db
    .select({ id: tags.id, name: tags.name })
    .from(tags)
    .orderBy(asc(tags.name));

  return rows;
}

// ─── getAllProjectOptions ───────────────────────────────────────────────────

export async function getAllProjectOptions(): Promise<
  { id: number; name: string }[]
> {
  const rows = await db
    .select({ id: projects.id, name: projects.name })
    .from(projects)
    .where(isNull(projects.deletedAt))
    .orderBy(asc(projects.name));

  return rows;
}

// ─── getLessonStats ─────────────────────────────────────────────────────────

export async function getLessonStats(): Promise<LessonStats> {
  const [totalRow, byTagRows] = await Promise.all([
    db
      .select({ count: count() })
      .from(lessonsLearned)
      .where(isNull(lessonsLearned.deletedAt)),

    db
      .select({
        tag: tags.name,
        count: count(),
      })
      .from(lessonTags)
      .innerJoin(tags, eq(lessonTags.tagId, tags.id))
      .innerJoin(
        lessonsLearned,
        and(
          eq(lessonTags.lessonId, lessonsLearned.id),
          isNull(lessonsLearned.deletedAt),
        ),
      )
      .groupBy(tags.name)
      .orderBy(desc(count()))
      .limit(10),
  ]);

  return {
    total: totalRow[0]?.count ?? 0,
    byTag: byTagRows.map((row) => ({ tag: row.tag, count: row.count })),
  };
}

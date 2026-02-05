import { relations } from "drizzle-orm";
import {
  bigserial,
  date,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Projects ────────────────────────────────────────────────────────────────

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }).notNull(),
  leaderName: varchar("leader_name", { length: 255 }).notNull(),
  leaderEmail: varchar("leader_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // idea | development | pilot
  decision: varchar("decision", { length: 20 }), // advance | consolidate | pause
  decisionDate: date("decision_date"),
  decisionNotes: text("decision_notes"),
  startDate: date("start_date"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── Project Milestones ──────────────────────────────────────────────────────

export const projectMilestones = pgTable("project_milestones", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  title: varchar("title", { length: 255 }).notNull(),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Project Duplications ────────────────────────────────────────────────────

export const projectDuplications = pgTable(
  "project_duplications",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    relatedProjectId: integer("related_project_id")
      .notNull()
      .references(() => projects.id),
    flaggedBy: varchar("flagged_by", { length: 255 }).notNull(),
    flaggedAt: timestamp("flagged_at").notNull().defaultNow(),
    notes: text("notes"),
    similarityScore: real("similarity_score"),
  },
  (table) => [unique().on(table.projectId, table.relatedProjectId)],
);

// ─── Tech Radar ──────────────────────────────────────────────────────────────

export const techRadar = pgTable("tech_radar", {
  id: serial("id").primaryKey(),
  technologyName: varchar("technology_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(), // explore | adopt | consolidate | avoid
  description: text("description"),
  rationale: text("rationale"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── Lessons Learned ─────────────────────────────────────────────────────────

export const lessonsLearned = pgTable("lessons_learned", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: varchar("updated_by", { length: 255 }).notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── Lesson-Projects Junction ────────────────────────────────────────────────

export const lessonProjects = pgTable(
  "lesson_projects",
  {
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessonsLearned.id),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.projectId] })],
);

// ─── Tags ────────────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Project-Tags Junction ──────────────────────────────────────────────────

export const projectTags = pgTable(
  "project_tags",
  {
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.tagId] })],
);

// ─── Lesson-Tags Junction ───────────────────────────────────────────────────

export const lessonTags = pgTable(
  "lesson_tags",
  {
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessonsLearned.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => [primaryKey({ columns: [table.lessonId, table.tagId] })],
);

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  tableName: varchar("table_name", { length: 50 }).notNull(),
  recordId: integer("record_id").notNull(),
  action: varchar("action", { length: 10 }).notNull(), // INSERT | UPDATE | DELETE
  changedFields: jsonb("changed_fields"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  performedBy: varchar("performed_by", { length: 255 }).notNull(),
  performedAt: timestamp("performed_at").notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const projectsRelations = relations(projects, ({ many }) => ({
  milestones: many(projectMilestones),
  duplicationsAsSource: many(projectDuplications, {
    relationName: "sourceProject",
  }),
  duplicationsAsRelated: many(projectDuplications, {
    relationName: "relatedProject",
  }),
  projectTags: many(projectTags),
  lessonProjects: many(lessonProjects),
}));

export const projectMilestonesRelations = relations(
  projectMilestones,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectMilestones.projectId],
      references: [projects.id],
    }),
  }),
);

export const projectDuplicationsRelations = relations(
  projectDuplications,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectDuplications.projectId],
      references: [projects.id],
      relationName: "sourceProject",
    }),
    relatedProject: one(projects, {
      fields: [projectDuplications.relatedProjectId],
      references: [projects.id],
      relationName: "relatedProject",
    }),
  }),
);

export const lessonsLearnedRelations = relations(
  lessonsLearned,
  ({ many }) => ({
    lessonProjects: many(lessonProjects),
    lessonTags: many(lessonTags),
  }),
);

export const lessonProjectsRelations = relations(
  lessonProjects,
  ({ one }) => ({
    lesson: one(lessonsLearned, {
      fields: [lessonProjects.lessonId],
      references: [lessonsLearned.id],
    }),
    project: one(projects, {
      fields: [lessonProjects.projectId],
      references: [projects.id],
    }),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  projectTags: many(projectTags),
  lessonTags: many(lessonTags),
}));

export const projectTagsRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));

export const lessonTagsRelations = relations(lessonTags, ({ one }) => ({
  lesson: one(lessonsLearned, {
    fields: [lessonTags.lessonId],
    references: [lessonsLearned.id],
  }),
  tag: one(tags, {
    fields: [lessonTags.tagId],
    references: [tags.id],
  }),
}));

CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"table_name" varchar(50) NOT NULL,
	"record_id" integer NOT NULL,
	"action" varchar(10) NOT NULL,
	"changed_fields" jsonb,
	"old_values" jsonb,
	"new_values" jsonb,
	"performed_by" varchar(255) NOT NULL,
	"performed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_projects" (
	"lesson_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	CONSTRAINT "lesson_projects_lesson_id_project_id_pk" PRIMARY KEY("lesson_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_tags" (
	"lesson_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "lesson_tags_lesson_id_tag_id_pk" PRIMARY KEY("lesson_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "lessons_learned" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar(255) NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "project_duplications" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"related_project_id" integer NOT NULL,
	"flagged_by" varchar(255) NOT NULL,
	"flagged_at" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"similarity_score" real,
	CONSTRAINT "project_duplications_project_id_related_project_id_unique" UNIQUE("project_id","related_project_id")
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"target_date" date,
	"completed_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_tags" (
	"project_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "project_tags_project_id_tag_id_pk" PRIMARY KEY("project_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"department" varchar(100) NOT NULL,
	"leader_name" varchar(255) NOT NULL,
	"leader_email" varchar(255) NOT NULL,
	"status" varchar(20) NOT NULL,
	"decision" varchar(20),
	"decision_date" date,
	"decision_notes" text,
	"start_date" date,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar(255) NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "tech_radar" (
	"id" serial PRIMARY KEY NOT NULL,
	"technology_name" varchar(255) NOT NULL,
	"category" varchar(20) NOT NULL,
	"description" text,
	"rationale" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar(255) NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "lesson_projects" ADD CONSTRAINT "lesson_projects_lesson_id_lessons_learned_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons_learned"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_projects" ADD CONSTRAINT "lesson_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_lesson_id_lessons_learned_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons_learned"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_tags" ADD CONSTRAINT "lesson_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_duplications" ADD CONSTRAINT "project_duplications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_duplications" ADD CONSTRAINT "project_duplications_related_project_id_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE no action ON UPDATE no action;
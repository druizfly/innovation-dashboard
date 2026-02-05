import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";

// Load .env file if DIRECT_DATABASE_URL is not set
if (!process.env.DIRECT_DATABASE_URL) {
  const envPath = resolve(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    process.env[key] = val;
  }
}

const CUSTOM_SQL = `
-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add generated tsvector columns for full-text search
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

ALTER TABLE tech_radar
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(technology_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(rationale, '')), 'B')
  ) STORED;

ALTER TABLE lessons_learned
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED;

-- GIN indexes on search_vector columns
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_tech_radar_search ON tech_radar USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_lessons_learned_search ON lessons_learned USING GIN (search_vector);

-- Trigram indexes for fuzzy name matching
CREATE INDEX IF NOT EXISTS idx_projects_name_trgm ON projects USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tech_radar_name_trgm ON tech_radar USING GIN (technology_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lessons_learned_title_trgm ON lessons_learned USING GIN (title gin_trgm_ops);

-- Partial indexes for soft-deleted records
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tech_radar_active ON tech_radar (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_learned_active ON lessons_learned (id) WHERE deleted_at IS NULL;

-- Composite dashboard index
CREATE INDEX IF NOT EXISTS idx_projects_dashboard ON projects (department, status, decision) WHERE deleted_at IS NULL;

-- Junction table reverse lookups
CREATE INDEX IF NOT EXISTS idx_project_tags_tag_id ON project_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_lesson_tags_tag_id ON lesson_tags (tag_id);
CREATE INDEX IF NOT EXISTS idx_lesson_projects_project_id ON lesson_projects (project_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON audit_log (performed_at DESC);
`;

async function runCustomMigrations() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_DATABASE_URL,
  });

  try {
    console.log("Running custom migrations...");
    await pool.query(CUSTOM_SQL);
    console.log("Custom migrations completed successfully.");
  } catch (error) {
    console.error("Custom migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runCustomMigrations();

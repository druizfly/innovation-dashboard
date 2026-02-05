# Innovation Management Dashboard

Centralized innovation management platform that enables strategic visibility across 30+ departments, helping leadership identify duplication, make governance decisions, and guide technology adoption.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Quick Start

```bash
# 1. Set up environment
cp .env.example .env

# 2. Start database
docker compose up -d

# 3. Install dependencies
npm install

# 4. Run database migrations
npm run db:push

# 5. Seed sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run tests (Vitest, watch mode) |
| `npm run test:unit` | Run tests once |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Drizzle Studio |

## Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Turbopack)
- **Language:** TypeScript (strict mode)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui (Radix UI)
- **Database:** PostgreSQL 16 + PgBouncer (connection pooling)
- **ORM:** Drizzle ORM
- **Validation:** Zod v4
- **Charts:** Recharts
- **Data Tables:** TanStack Table
- **Markdown:** react-markdown + remark-gfm
- **Testing:** Vitest

## Modules

### Analytics Dashboard (`/`)
Executive overview with KPI cards, status/decision pie charts, department bar charts, and project timeline area chart.

### Projects (`/projects`)
Full CRUD for innovation projects with paginated data table, full-text search, department/status/decision filters, milestones, and duplication tracking.

### Tech Radar (`/tech-radar`)
Technology assessment organized by category (Adopt, Explore, Consolidate, Avoid) with search and category filtering.

### Lessons Learned (`/lessons`)
Knowledge base with markdown content rendering, tag-based organization, related project linking, and full-text search.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Analytics dashboard
│   ├── projects/             # Projects CRUD + server actions
│   ├── tech-radar/           # Tech Radar CRUD + server actions
│   └── lessons/              # Lessons CRUD + server actions
├── components/
│   ├── analytics/            # Recharts chart components
│   ├── layout/               # Sidebar, header
│   ├── projects/             # Project table, filters, form
│   ├── tech-radar/           # Category badges, filters, form
│   ├── lessons/              # Lesson cards, filters, form, markdown
│   └── ui/                   # shadcn/ui + custom badge components
├── lib/
│   ├── db/
│   │   ├── schema.ts         # 10-table Drizzle schema
│   │   ├── queries/          # Data access layer per module
│   │   └── custom-migrations.ts # tsvector + GIN indexes
│   └── validations/          # Zod schemas per module
└── scripts/
    └── seed.ts               # Sample data (30 projects, 20 tech items, 10 lessons)
```

## Architecture

- **Server Components** with `<Suspense>` boundaries for streaming data
- **Server Actions** (`"use server"`) for all mutations with `useActionState()` form handling
- **URL-based filter state** via `useSearchParams()` for shareable/bookmarkable views
- **Full-text search** using PostgreSQL `tsvector` columns with GIN indexes
- **Soft deletes** via `deletedAt` column across all entities
- **Optimistic concurrency** control using `expectedUpdatedAt` timestamps
- **Batch loading** to avoid N+1 queries on list views
- **PgBouncer** for connection pooling in transaction mode

## Database

Docker Compose runs PostgreSQL on port `5433` and PgBouncer on port `6432`:

- `DATABASE_URL` (port 6432) — used by the application (pooled connections)
- `DIRECT_DATABASE_URL` (port 5433) — used for migrations and seeding

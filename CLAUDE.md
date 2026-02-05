# CLAUDE.md

## Project Overview

Innovation Management Dashboard — a Next.js 16 full-stack application for tracking innovation projects, technology radar, and lessons learned across departments.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint (runs `eslint`, NOT `next lint`)
npm run typecheck    # TypeScript type checking
npm run test:unit    # Run tests once (Vitest)
npm run test         # Run tests in watch mode
npm run db:push      # Push schema to database
npm run db:seed      # Seed sample data
```

## Architecture

- **Next.js 16 App Router** with React 19 Server Components
- **Server Actions** (`"use server"`) for all mutations — no API routes
- **Drizzle ORM** with PostgreSQL 16 + PgBouncer
- **Zod v4** for validation, **Tailwind CSS v4** + **shadcn/ui** for UI
- **Recharts** for analytics charts, **TanStack Table** for data tables
- **react-markdown** + **remark-gfm** for markdown rendering

## Key Patterns

### Data Flow
- Data access layer: `src/lib/db/queries/{module}.ts` — Drizzle queries with soft-delete filtering
- Server Actions: `src/app/{module}/actions.ts` — FormData parsing, Zod validation, optimistic concurrency
- Pages: Async Server Components with `<Suspense>` boundaries for streaming

### Filters
- URL-based state via `useSearchParams()` + `useRouter().replace()` in `"use client"` filter components
- Full-text search via PostgreSQL `tsvector` columns + GIN indexes + `plainto_tsquery`

### Forms
- `useActionState()` for form state management
- `expectedUpdatedAt` field for optimistic concurrency on updates
- Soft deletes via `deletedAt` column — all queries filter with `isNull(deletedAt)`

### Database
- `DATABASE_URL` (port 6432, PgBouncer) for the app
- `DIRECT_DATABASE_URL` (port 5433, direct Postgres) for migrations/seeds
- Singleton connection pattern in `src/lib/db/index.ts` to prevent hot-reload leaks

## Zod v4 Gotchas

- `z.record()` requires 2 args: `z.record(z.string(), z.unknown())`
- `ZodError.issues[].path` is `PropertyKey[]`, not `(string | number)[]` — use `.map(String).join(".")`

## Known Warnings

- TanStack Table `useReactTable` triggers React Compiler `incompatible-library` warning — this is expected and harmless

## File Organization

```
src/app/{module}/actions.ts        — Server Actions (CRUD)
src/app/{module}/page.tsx          — List page (Server Component + Suspense)
src/app/{module}/[id]/page.tsx     — Detail page
src/app/{module}/[id]/edit/page.tsx — Edit page
src/app/{module}/create/page.tsx   — Create page
src/lib/db/queries/{module}.ts     — Data access layer
src/lib/db/schema.ts               — 10-table Drizzle schema with relations
src/lib/validations/{module}.ts    — Zod validation schemas
src/components/{module}/           — Module-specific UI components
src/components/ui/                 — shadcn/ui + custom badge components
```

## Style Guide

- ESLint config: `.claude/**` and `scripts/**` are in `globalIgnores`
- Prefer editing existing files over creating new ones
- Keep Server Components async, Client Components marked with `"use client"`
- Batch-load related data to avoid N+1 (load page of items, then IN-query for relations)

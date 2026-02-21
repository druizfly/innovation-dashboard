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
- Server Actions: `src/app/(public)/{module}/actions.ts` — FormData parsing, Zod validation, optimistic concurrency
- Components importing actions must use `@/app/(public)/...` path (route group is part of the filesystem path)
- Pages: Async Server Components with `<Suspense>` boundaries for streaming

### Filters
- URL-based state via `useSearchParams()` + `useRouter().replace()` in `"use client"` filter components
- Full-text search via PostgreSQL `tsvector` columns + GIN indexes + `plainto_tsquery`

### Forms
- `useActionState()` for form state management
- `expectedUpdatedAt` field for optimistic concurrency on updates
- Pass `updatedAt` as ISO string (not `Date`) from Server→Client Components to avoid RSC serialization issues
- Use `date_trunc('milliseconds', ...)` in SQL comparisons — PG `timestamp` has microsecond precision vs JS `Date` millisecond precision
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

## React Compiler Lint Rules

- `react-hooks/refs` — cannot read `ref.current` during render (in JSX, `useMemo`, etc.) — only in callbacks/effects
- `react-hooks/set-state-in-effect` — cannot call `setState` synchronously inside `useEffect` — derive values via `useMemo` instead

## Admin Dashboard

- Route group isolation: `(public)/` layout has public sidebar, `admin/` layout has admin sidebar — no nesting
- Admin auth via `src/lib/auth.ts` (JWT session cookie) + `src/middleware.ts` (protects `/admin/*` except `/admin/login`)
- Admin tables (`AdminTechRadarTable`, `AdminLessonsTable`) in `src/components/admin/` with inline edit/delete actions
- `ProjectTable` accepts `basePath` prop for admin routing (`/admin/projects` vs `/projects`)

## Deployment (Vercel)

- `vercel-build` script runs `next build` only — no schema migrations in CI
- `search_vector` columns exist in DB via raw SQL but are NOT in the Drizzle schema — `drizzle-kit push` will try to drop them
- Vercel env vars: `DATABASE_URL` and `DIRECT_DATABASE_URL` point to Neon (not local Docker)
- Vercel env vars: `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` required for admin auth
- Use `printf` (not `echo`) when piping env values to `vercel env add` to avoid trailing newlines

## File Organization

```
src/app/(public)/{module}/actions.ts        — Server Actions (CRUD)
src/app/(public)/{module}/page.tsx          — List page (Server Component + Suspense)
src/app/(public)/{module}/[id]/page.tsx     — Detail page
src/app/(public)/{module}/[id]/edit/page.tsx — Edit page
src/app/(public)/{module}/create/page.tsx   — Create page
src/app/admin/{module}/page.tsx             — Admin list page (management tables)
src/app/admin/{module}/[id]/edit/page.tsx   — Admin edit page
src/lib/db/queries/{module}.ts     — Data access layer
src/lib/db/schema.ts               — 10-table Drizzle schema with relations
src/lib/validations/{module}.ts    — Zod validation schemas
src/components/{module}/           — Module-specific UI components
src/components/admin/              — Admin-specific components (tables, sidebar, header)
src/components/ui/                 — shadcn/ui + custom badge components
```

## Style Guide

- ESLint config: `.claude/**` and `scripts/**` are in `globalIgnores`
- Prefer editing existing files over creating new ones
- Keep Server Components async, Client Components marked with `"use client"`
- Batch-load related data to avoid N+1 (load page of items, then IN-query for relations)

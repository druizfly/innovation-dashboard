import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, getDepartments, getProjectStats } from "@/lib/db/queries/projects";
import { ProjectFilters } from "@/components/projects/project-filters";
import { ProjectTable } from "@/components/projects/project-table";

const PAGE_SIZE = 20;

interface AdminProjectsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 flex-1" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

async function ProjectStats() {
  const stats = await getProjectStats();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Total Projects" value={stats.total} />
      <StatCard label="Ideas" value={stats.byStatus["idea"] ?? 0} />
      <StatCard label="In Development" value={stats.byStatus["development"] ?? 0} />
      <StatCard label="In Pilot" value={stats.byStatus["pilot"] ?? 0} />
    </div>
  );
}

async function ProjectListContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const department =
    typeof searchParams.department === "string" ? searchParams.department : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const decision = typeof searchParams.decision === "string" ? searchParams.decision : undefined;
  const page = typeof searchParams.page === "string" ? Math.max(1, parseInt(searchParams.page, 10) || 1) : 1;

  const [{ projects, totalCount }, departments] = await Promise.all([
    getProjects({ search, department, status, decision, page, pageSize: PAGE_SIZE }),
    getDepartments(),
  ]);

  return (
    <>
      <ProjectFilters departments={departments} />
      <ProjectTable
        projects={projects}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        basePath="/admin/projects"
      />
    </>
  );
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Innovation Projects</h2>
          <p className="text-muted-foreground">
            Manage innovation projects across all departments.
          </p>
        </div>
        <Link href="/admin/projects/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectStats />
      </Suspense>

      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectListContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

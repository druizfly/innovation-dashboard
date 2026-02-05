import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOverviewStats,
  getProjectsByDepartment,
  getProjectsByStatusAndDepartment,
  getDecisionBreakdown,
  getProjectTimeline,
} from "@/lib/db/queries/analytics";
import { getProjectStats } from "@/lib/db/queries/projects";
import {
  OverviewCards,
  StatusPieChart,
  DecisionDonutChart,
  DepartmentBarChart,
  DepartmentStatusChart,
  TimelineChart,
  STATUS_COLORS,
  DECISION_COLORS,
} from "@/components/analytics/charts";

function CardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-[340px] w-full rounded-lg" />;
}

async function OverviewSection() {
  const stats = await getOverviewStats();
  return <OverviewCards stats={stats} />;
}

async function StatusAndDecisionSection() {
  const [projectStats, decisionBreakdown] = await Promise.all([
    getProjectStats(),
    getDecisionBreakdown(),
  ]);

  const statusData = Object.entries(projectStats.byStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    fill: STATUS_COLORS[name] ?? "#94a3b8",
  }));

  const decisionData = decisionBreakdown.map((d) => ({
    name: d.decision.charAt(0).toUpperCase() + d.decision.slice(1),
    value: d.count,
    fill: DECISION_COLORS[d.decision] ?? "#94a3b8",
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <StatusPieChart data={statusData} />
      <DecisionDonutChart data={decisionData} />
    </div>
  );
}

async function DepartmentSection() {
  const [byDepartment, byStatusAndDepartment] = await Promise.all([
    getProjectsByDepartment(),
    getProjectsByStatusAndDepartment(),
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DepartmentBarChart data={byDepartment} />
      <DepartmentStatusChart data={byStatusAndDepartment} />
    </div>
  );
}

async function TimelineSection() {
  const timeline = await getProjectTimeline();

  if (timeline.length === 0) return null;

  return <TimelineChart data={timeline} />;
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Innovation portfolio overview across all departments.
        </p>
      </div>

      <Suspense fallback={<CardsSkeleton />}>
        <OverviewSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <StatusAndDecisionSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        }
      >
        <DepartmentSection />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <TimelineSection />
      </Suspense>
    </div>
  );
}

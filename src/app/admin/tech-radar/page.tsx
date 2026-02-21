import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTechRadarItems } from "@/lib/db/queries/tech-radar";
import { TechRadarFilters } from "@/components/tech-radar/tech-radar-filters";
import { AdminTechRadarTable } from "@/components/admin/admin-tech-radar-table";

interface AdminTechRadarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function TechRadarSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}

async function TechRadarContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q : undefined;
  const category =
    typeof searchParams.category === "string" ? searchParams.category : undefined;
  const quadrant =
    typeof searchParams.quadrant === "string" ? searchParams.quadrant : undefined;

  const items = await getTechRadarItems({ search, category, quadrant });

  const categories = [...new Set(items.map((i) => i.category))].sort();
  const itemCounts: Record<string, number> = {};
  for (const item of items) {
    itemCounts[item.category] = (itemCounts[item.category] ?? 0) + 1;
  }

  return (
    <>
      <TechRadarFilters categories={categories} itemCounts={itemCounts} />
      <AdminTechRadarTable
        items={items.map((item) => ({
          id: item.id,
          technologyName: item.technologyName,
          category: item.category,
          quadrant: item.quadrant,
          updatedAt: item.updatedAt,
        }))}
      />
    </>
  );
}

export default async function AdminTechRadarPage({
  searchParams,
}: AdminTechRadarPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tech Radar</h2>
          <p className="text-muted-foreground">
            Manage technologies across explore, adopt, consolidate, and avoid categories.
          </p>
        </div>
        <Link href="/admin/tech-radar/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Technology
          </Button>
        </Link>
      </div>

      <Suspense fallback={<TechRadarSkeleton />}>
        <TechRadarContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

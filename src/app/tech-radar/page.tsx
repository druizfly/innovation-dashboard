import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTechRadarForRadarView } from "@/lib/db/queries/tech-radar";
import { TechRadarFilters } from "@/components/tech-radar/tech-radar-filters";
import { TechRadarRadarPage } from "@/components/tech-radar/tech-radar-radar-page";

interface TechRadarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function TechRadarSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <Skeleton className="aspect-square w-full max-w-[700px]" />
      </div>
      <div className="w-full lg:w-80">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
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

  const items = await getTechRadarForRadarView(search);

  const radarItems = items.map((item) => ({
    id: item.id,
    technologyName: item.technologyName,
    category: item.category,
    quadrant: item.quadrant,
    description: item.description,
  }));

  return (
    <>
      <TechRadarFilters categories={[]} itemCounts={{}} radarMode />

      {radarItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground text-lg font-medium">
            No technologies found
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {search
              ? "Try adjusting your search query."
              : "Start by adding technologies your organization is evaluating."}
          </p>
        </div>
      ) : (
        <TechRadarRadarPage items={radarItems} />
      )}
    </>
  );
}

export default async function TechRadarPage({
  searchParams,
}: TechRadarPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tech Radar</h2>
          <p className="text-muted-foreground">
            Strategic view of technologies across explore, adopt, consolidate,
            and avoid categories.
          </p>
        </div>
        <Link href="/tech-radar/create">
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

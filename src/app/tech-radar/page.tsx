import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getTechRadarGroupedByCategory, getTechRadarStats } from "@/lib/db/queries/tech-radar";
import { TechRadarFilters } from "@/components/tech-radar/tech-radar-filters";
import { CategoryBadge } from "@/components/tech-radar/category-badge";

interface TechRadarPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  adopt: "Technologies we recommend for broad use across the organization.",
  explore: "Technologies worth investigating in pilot projects.",
  consolidate: "Technologies to maintain but not expand; migrate away over time.",
  avoid: "Technologies that should not be used in new projects.",
};

function TechRadarSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  );
}

async function TechRadarContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const category =
    typeof searchParams.category === "string" ? searchParams.category : undefined;

  const [groups, stats] = await Promise.all([
    getTechRadarGroupedByCategory(search),
    getTechRadarStats(),
  ]);

  // If a category filter is active, only show that category
  const filteredGroups = category
    ? groups.filter((g) => g.category === category)
    : groups;

  const categories = ["adopt", "explore", "consolidate", "avoid"];

  return (
    <>
      <TechRadarFilters categories={categories} itemCounts={stats} />

      {filteredGroups.length === 0 ? (
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
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <section key={group.category}>
              <div className="mb-4 flex items-center gap-3">
                <CategoryBadge
                  category={
                    group.category as
                      | "adopt"
                      | "explore"
                      | "consolidate"
                      | "avoid"
                  }
                />
                <span className="text-muted-foreground text-sm">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "technology" : "technologies"}
                </span>
              </div>
              {CATEGORY_DESCRIPTIONS[group.category] && (
                <p className="text-muted-foreground mb-4 text-sm">
                  {CATEGORY_DESCRIPTIONS[group.category]}
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Link key={item.id} href={`/tech-radar/${item.id}`}>
                    <Card className="h-full transition-colors hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {item.technologyName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {item.description ? (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.description}
                          </p>
                        ) : (
                          <p className="text-muted-foreground text-sm italic">
                            No description
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
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

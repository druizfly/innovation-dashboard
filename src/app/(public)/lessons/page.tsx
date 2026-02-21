import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getLessons, getAllTags } from "@/lib/db/queries/lessons";
import { LessonFilters } from "@/components/lessons/lesson-filters";
import { LessonCard } from "@/components/lessons/lesson-card";

interface LessonsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function LessonsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  );
}

async function LessonsContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q : undefined;
  const tag =
    typeof searchParams.tag === "string" ? searchParams.tag : undefined;
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;

  const [{ lessons, totalCount }, allTags] = await Promise.all([
    getLessons({ search, tag, page }),
    getAllTags(),
  ]);

  return (
    <>
      <LessonFilters tags={allTags} />

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-muted-foreground text-lg font-medium">
            No lessons found
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            {search || tag
              ? "Try adjusting your filters."
              : "Share what your team has learned from past projects."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {totalCount} {totalCount === 1 ? "lesson" : "lessons"} found
          </p>
          {lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}
    </>
  );
}

export default async function LessonsPage({
  searchParams,
}: LessonsPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Lessons Learned
        </h2>
        <p className="text-muted-foreground">
          Knowledge base documenting insights from completed or paused
          projects.
        </p>
      </div>

      <Suspense fallback={<LessonsSkeleton />}>
        <LessonsContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

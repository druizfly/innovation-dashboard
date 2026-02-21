import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLessons, getAllTags } from "@/lib/db/queries/lessons";
import { LessonFilters } from "@/components/lessons/lesson-filters";
import { AdminLessonsTable } from "@/components/admin/admin-lessons-table";

interface AdminLessonsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function LessonsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[400px] w-full" />
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

  const [{ lessons }, allTags] = await Promise.all([
    getLessons({ search, tag, page }),
    getAllTags(),
  ]);

  return (
    <>
      <LessonFilters tags={allTags} />
      <AdminLessonsTable
        lessons={lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          author: lesson.author,
          tags: lesson.tags,
          createdAt: lesson.createdAt,
        }))}
      />
    </>
  );
}

export default async function AdminLessonsPage({
  searchParams,
}: AdminLessonsPageProps) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Lessons Learned
          </h2>
          <p className="text-muted-foreground">
            Manage insights from completed or paused projects.
          </p>
        </div>
        <Link href="/admin/lessons/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lesson
          </Button>
        </Link>
      </div>

      <Suspense fallback={<LessonsSkeleton />}>
        <LessonsContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}

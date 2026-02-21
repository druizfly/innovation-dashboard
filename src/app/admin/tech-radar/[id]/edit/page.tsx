import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTechRadarItemById } from "@/lib/db/queries/tech-radar";
import { TechRadarForm } from "@/components/tech-radar/tech-radar-form";

interface AdminEditTechRadarPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTechRadarPage({
  params,
}: AdminEditTechRadarPageProps) {
  const { id } = await params;
  const itemId = parseInt(id, 10);

  if (isNaN(itemId)) {
    notFound();
  }

  const item = await getTechRadarItemById(itemId);

  if (!item) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/admin/tech-radar/${item.id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Technology
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">Edit Technology</h2>
        <p className="text-muted-foreground">
          Update the details for &quot;{item.technologyName}&quot;.
        </p>
      </div>

      <TechRadarForm
        item={{
          id: item.id,
          technologyName: item.technologyName,
          category: item.category,
          quadrant: item.quadrant,
          description: item.description,
          rationale: item.rationale,
          url: item.url,
          updatedAt: item.updatedAt.toISOString(),
        }}
        basePath="/admin/tech-radar"
      />
    </div>
  );
}

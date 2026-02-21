import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { getTechRadarItemById } from "@/lib/db/queries/tech-radar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryBadge } from "@/components/tech-radar/category-badge";
import { QuadrantBadge } from "@/components/tech-radar/quadrant-badge";

interface TechRadarDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function TechRadarDetailPage({
  params,
}: TechRadarDetailPageProps) {
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
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            href="/tech-radar"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tech Radar
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            {item.technologyName}
          </h2>
          <div className="flex gap-2">
            <CategoryBadge
              category={
                item.category as "adopt" | "explore" | "consolidate" | "avoid"
              }
            />
            <QuadrantBadge
              quadrant={
                item.quadrant as
                  | "languages-frameworks"
                  | "tools"
                  | "platforms"
                  | "techniques"
              }
            />
          </div>
        </div>
      </div>

      {item.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </CardContent>
        </Card>
      )}

      {item.rationale && (
        <Card>
          <CardHeader>
            <CardTitle>Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {item.rationale}
            </p>
          </CardContent>
        </Card>
      )}

      {item.url && (
        <Card>
          <CardHeader>
            <CardTitle>URL</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 hover:underline"
            >
              {item.url}
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm">
                {dateFormatter.format(new Date(item.createdAt))}
              </p>
              <p className="text-muted-foreground text-xs">Created</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <div>
              <p className="text-sm">
                {dateFormatter.format(new Date(item.updatedAt))}
              </p>
              <p className="text-muted-foreground text-xs">Last Updated</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

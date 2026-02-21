import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Clock,
  Pencil,
} from "lucide-react";
import { getProjectById } from "@/lib/db/queries/projects";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { DecisionBadge } from "@/components/ui/decision-badge";
import { DuplicationBadge } from "@/components/ui/duplication-badge";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";

interface AdminProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default async function AdminProjectDetailPage({
  params,
}: AdminProjectDetailPageProps) {
  const { id } = await params;
  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Link
            href="/admin/projects"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={project.status as "idea" | "development" | "pilot"}
            />
            <DecisionBadge
              decision={
                project.decision as
                  | "advance"
                  | "consolidate"
                  | "pause"
                  | null
              }
            />
            {project.duplications.length > 0 && (
              <DuplicationBadge count={project.duplications.length} />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/projects/${project.id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
            redirectPath="/admin/projects"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {project.description ? (
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided.
                </p>
              )}
            </CardContent>
          </Card>

          {project.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            milestone.completedDate
                              ? "bg-emerald-500"
                              : "bg-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={
                            milestone.completedDate
                              ? "text-muted-foreground line-through"
                              : "font-medium"
                          }
                        >
                          {milestone.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {milestone.completedDate ? (
                          <span className="text-emerald-600">
                            Completed{" "}
                            {dateFormatter.format(
                              new Date(milestone.completedDate),
                            )}
                          </span>
                        ) : milestone.targetDate ? (
                          <span className="text-muted-foreground">
                            Target{" "}
                            {dateFormatter.format(
                              new Date(milestone.targetDate),
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.duplications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Related Projects
                  <DuplicationBadge count={project.duplications.length} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.duplications.map((dup) => (
                    <div
                      key={dup.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <Link
                          href={`/admin/projects/${dup.relatedProjectId}`}
                          className="font-medium hover:underline"
                        >
                          {dup.relatedProjectName}
                        </Link>
                        {dup.notes && (
                          <p className="text-muted-foreground mt-0.5 text-sm">
                            {dup.notes}
                          </p>
                        )}
                      </div>
                      {dup.similarityScore !== null && (
                        <Badge variant="outline">
                          {Math.round(dup.similarityScore * 100)}% similar
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {project.decisionNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Decision Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {project.decisionNotes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">{project.leaderName}</p>
                  <p className="text-muted-foreground text-xs">Project Leader</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <p className="text-sm">{project.leaderEmail}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Department
                </p>
                <p className="text-sm font-medium">{project.department}</p>
              </div>
              {project.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm">
                      {dateFormatter.format(new Date(project.startDate))}
                    </p>
                    <p className="text-muted-foreground text-xs">Start Date</p>
                  </div>
                </div>
              )}
              {project.decisionDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <div>
                    <p className="text-sm">
                      {dateFormatter.format(new Date(project.decisionDate))}
                    </p>
                    <p className="text-muted-foreground text-xs">Decision Date</p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="text-sm">
                    {dateFormatter.format(new Date(project.createdAt))}
                  </p>
                  <p className="text-muted-foreground text-xs">Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {project.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

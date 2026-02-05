import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAX_VISIBLE_TAGS = 5;
const PREVIEW_LENGTH = 150;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

interface LessonCardProps {
  lesson: {
    id: number;
    title: string;
    content: string;
    author: string;
    createdAt: Date;
    tags: string[];
    relatedProjects: { id: number; name: string }[];
  };
}

export function LessonCard({ lesson }: LessonCardProps) {
  const preview =
    lesson.content.length > PREVIEW_LENGTH
      ? lesson.content.substring(0, PREVIEW_LENGTH) + "..."
      : lesson.content;

  const visibleTags = lesson.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTags = lesson.tags.length - MAX_VISIBLE_TAGS;

  return (
    <Link href={`/lessons/${lesson.id}`} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground group-hover:text-primary transition-colors">
            {lesson.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {preview}
          </p>

          {lesson.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {remainingTags > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingTags}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{lesson.author}</span>
            {lesson.relatedProjects.length > 0 && (
              <span className="text-muted-foreground">
                {lesson.relatedProjects.length}{" "}
                {lesson.relatedProjects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {dateFormatter.format(lesson.createdAt)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

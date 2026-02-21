"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteLessonButton } from "@/components/lessons/delete-lesson-button";

interface Lesson {
  id: number;
  title: string;
  author: string;
  tags: string[];
  createdAt: Date;
}

interface AdminLessonsTableProps {
  lessons: Lesson[];
}

const MAX_VISIBLE_TAGS = 3;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const columns: ColumnDef<Lesson>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/admin/lessons/${row.original.id}`}
        className="text-foreground hover:text-primary font-medium underline-offset-4 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ getValue }) => {
      const tags = getValue<string[]>();
      if (tags.length === 0) {
        return (
          <span className="text-muted-foreground text-xs">--</span>
        );
      }

      const visible = tags.slice(0, MAX_VISIBLE_TAGS);
      const remaining = tags.length - MAX_VISIBLE_TAGS;

      return (
        <div className="flex flex-wrap gap-1">
          {visible.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {remaining > 0 && (
            <Badge variant="outline" className="text-xs">
              +{remaining}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ getValue }) => {
      const date = getValue<Date>();
      return (
        <span className="text-muted-foreground text-sm">
          {dateFormatter.format(date)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href={`/admin/lessons/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <DeleteLessonButton
          lessonId={row.original.id}
          lessonTitle={row.original.title}
          redirectPath="/admin/lessons"
        />
      </div>
    ),
  },
];

export function AdminLessonsTable({ lessons }: AdminLessonsTableProps) {
  const router = useRouter();

  const table = useReactTable({
    data: lessons,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = useCallback(
    (lessonId: number) => {
      router.push(`/admin/lessons/${lessonId}`);
    },
    [router],
  );

  const isEmpty = useMemo(() => lessons.length === 0, [lessons.length]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground text-lg font-medium">
          No lessons found
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => handleRowClick(row.original.id)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

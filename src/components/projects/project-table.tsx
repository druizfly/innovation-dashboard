"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DecisionBadge } from "@/components/ui/decision-badge";
import { DuplicationBadge } from "@/components/ui/duplication-badge";

interface Project {
  id: number;
  name: string;
  department: string;
  leaderName: string;
  status: string;
  decision: string | null;
  duplicationsCount: number;
  tags: string[];
  createdAt: Date;
}

interface ProjectTableProps {
  projects: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
  basePath?: string;
}

const MAX_VISIBLE_TAGS = 3;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function getColumns(basePath: string): ColumnDef<Project>[] {
  return [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`${basePath}/${row.original.id}`}
        className="text-foreground hover:text-primary font-medium underline-offset-4 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "leaderName",
    header: "Leader",
    cell: ({ getValue }) => getValue<string>(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return (
        <StatusBadge
          status={status as "idea" | "development" | "pilot"}
        />
      );
    },
  },
  {
    accessorKey: "decision",
    header: "Decision",
    cell: ({ getValue }) => {
      const decision = getValue<string | null>();
      return (
        <DecisionBadge
          decision={
            decision as "advance" | "consolidate" | "pause" | null
          }
        />
      );
    },
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
    accessorKey: "duplicationsCount",
    header: "Duplications",
    cell: ({ getValue }) => {
      const count = getValue<number>();
      if (count === 0) {
        return (
          <span className="text-muted-foreground text-xs">--</span>
        );
      }
      return <DuplicationBadge count={count} />;
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
  ];
}

export function ProjectTable({
  projects,
  totalCount,
  page,
  pageSize,
  basePath = "/projects",
}: ProjectTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const columns = useMemo(() => getColumns(basePath), [basePath]);

  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const navigateToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }

      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleRowClick = useCallback(
    (projectId: number) => {
      router.push(`${basePath}/${projectId}`);
    },
    [router, basePath],
  );

  // Memoize the empty state check
  const isEmpty = useMemo(() => projects.length === 0, [projects.length]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground text-lg font-medium">
          No projects found
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Showing {rangeStart}-{rangeEnd} of {totalCount} results
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

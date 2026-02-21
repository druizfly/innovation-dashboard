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
import { CategoryBadge } from "@/components/tech-radar/category-badge";
import { QuadrantBadge } from "@/components/tech-radar/quadrant-badge";
import { DeleteTechRadarButton } from "@/components/tech-radar/delete-tech-radar-button";

interface TechRadarItem {
  id: number;
  technologyName: string;
  category: string;
  quadrant: string;
  updatedAt: Date;
}

interface AdminTechRadarTableProps {
  items: TechRadarItem[];
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const columns: ColumnDef<TechRadarItem>[] = [
  {
    accessorKey: "technologyName",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/admin/tech-radar/${row.original.id}`}
        className="text-foreground hover:text-primary font-medium underline-offset-4 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {row.original.technologyName}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <CategoryBadge
        category={getValue<string>() as "adopt" | "explore" | "consolidate" | "avoid"}
      />
    ),
  },
  {
    accessorKey: "quadrant",
    header: "Quadrant",
    cell: ({ getValue }) => (
      <QuadrantBadge
        quadrant={getValue<string>() as "tools" | "techniques" | "platforms" | "languages-frameworks"}
      />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
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
    header: "Actions",
    cell: ({ row }) => (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Link href={`/admin/tech-radar/${row.original.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
        <DeleteTechRadarButton
          itemId={row.original.id}
          itemName={row.original.technologyName}
          redirectPath="/admin/tech-radar"
        />
      </div>
    ),
  },
];

export function AdminTechRadarTable({ items }: AdminTechRadarTableProps) {
  const router = useRouter();

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = useCallback(
    (itemId: number) => {
      router.push(`/admin/tech-radar/${itemId}`);
    },
    [router],
  );

  const isEmpty = useMemo(() => items.length === 0, [items.length]);

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <p className="text-muted-foreground text-lg font-medium">
          No technologies found
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

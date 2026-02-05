"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEBOUNCE_MS = 300;

interface LessonFiltersProps {
  tags: { id: number; name: string }[];
}

export function LessonFilters({ tags }: LessonFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";
  const currentTag = searchParams.get("tag") ?? "";

  const [searchValue, setSearchValue] = useState(currentQuery);

  // Keep local search value in sync when URL changes externally
  useEffect(() => {
    setSearchValue(currentQuery);
  }, [currentQuery]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when any filter changes
      params.delete("page");

      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  // Debounced search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== currentQuery) {
        updateParams({ q: searchValue || null });
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchValue, currentQuery, updateParams]);

  const hasActiveFilters = currentQuery !== "" || currentTag !== "";

  function handleClearFilters() {
    setSearchValue("");
    updateParams({ q: null, tag: null });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search lessons..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setSearchValue("")}
              className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tag filter */}
        <Select
          value={currentTag}
          onValueChange={(value) =>
            updateParams({ tag: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag.id} value={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          {currentQuery && (
            <Badge variant="secondary" className="text-xs">
              Search: {currentQuery}
            </Badge>
          )}
          {currentTag && (
            <Badge variant="secondary" className="text-xs">
              Tag: {currentTag}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

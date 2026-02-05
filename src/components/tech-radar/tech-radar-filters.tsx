"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CategoryBadge } from "./category-badge";

const CATEGORIES = ["adopt", "explore", "consolidate", "avoid"] as const;

const DEBOUNCE_MS = 300;

interface TechRadarFiltersProps {
  categories: string[];
  itemCounts: Record<string, number>;
}

export function TechRadarFilters({
  categories,
  itemCounts,
}: TechRadarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

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

  function handleCategoryClick(category: string) {
    updateParams({
      category: currentCategory === category ? null : category,
    });
  }

  const totalCount = Object.values(itemCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search technologies..."
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

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => updateParams({ category: null })}
          className={
            !currentCategory
              ? "rounded-full ring-2 ring-ring ring-offset-1"
              : "rounded-full opacity-50 hover:opacity-80"
          }
          aria-pressed={!currentCategory}
          aria-label="Show all categories"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium">
            All
            <span className="text-muted-foreground">{totalCount}</span>
          </span>
        </button>

        {CATEGORIES.filter((cat) => categories.includes(cat)).map(
          (category) => {
            const isActive = currentCategory === category;
            const count = itemCounts[category] ?? 0;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={
                  isActive
                    ? "rounded-full ring-2 ring-ring ring-offset-1"
                    : "rounded-full opacity-50 hover:opacity-80"
                }
                aria-pressed={isActive}
                aria-label={`Filter by category: ${category}`}
              >
                <span className="inline-flex items-center gap-1">
                  <CategoryBadge
                    category={
                      category as
                        | "adopt"
                        | "explore"
                        | "consolidate"
                        | "avoid"
                    }
                  />
                  <span className="text-muted-foreground pr-1 text-xs">
                    {count}
                  </span>
                </span>
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}

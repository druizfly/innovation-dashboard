"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DecisionBadge } from "@/components/ui/decision-badge";

const STATUSES = ["idea", "development", "pilot"] as const;
const DECISIONS = ["advance", "consolidate", "pause"] as const;

const DEBOUNCE_MS = 300;

interface ProjectFiltersProps {
  departments: string[];
}

export function ProjectFilters({ departments }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get("q") ?? "";
  const currentDepartment = searchParams.get("department") ?? "";
  const currentStatuses = searchParams.get("status")
    ? searchParams.get("status")!.split(",")
    : [];
  const currentDecisions = searchParams.get("decision")
    ? searchParams.get("decision")!.split(",")
    : [];

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

  function handleDepartmentChange(value: string) {
    updateParams({ department: value === "all" ? null : value });
  }

  function toggleStatus(status: string) {
    const next = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    updateParams({ status: next.length > 0 ? next.join(",") : null });
  }

  function toggleDecision(decision: string) {
    const next = currentDecisions.includes(decision)
      ? currentDecisions.filter((d) => d !== decision)
      : [...currentDecisions, decision];

    updateParams({ decision: next.length > 0 ? next.join(",") : null });
  }

  function clearAllFilters() {
    setSearchValue("");
    router.replace("?");
  }

  const activeFilterCount =
    (currentQuery ? 1 : 0) +
    (currentDepartment ? 1 : 0) +
    currentStatuses.length +
    currentDecisions.length;

  return (
    <div className="space-y-4">
      {/* Search and Department row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search projects..."
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

        <Select
          value={currentDepartment || "all"}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status and Decision toggles */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Status filter */}
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Status
          </span>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((status) => {
              const isActive = currentStatuses.includes(status);
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => toggleStatus(status)}
                  className={
                    isActive
                      ? "rounded-full ring-2 ring-ring ring-offset-1"
                      : "rounded-full opacity-50 hover:opacity-80"
                  }
                  aria-pressed={isActive}
                  aria-label={`Filter by status: ${status}`}
                >
                  <StatusBadge status={status} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Decision filter */}
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Decision
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DECISIONS.map((decision) => {
              const isActive = currentDecisions.includes(decision);
              return (
                <button
                  key={decision}
                  type="button"
                  onClick={() => toggleDecision(decision)}
                  className={
                    isActive
                      ? "rounded-full ring-2 ring-ring ring-offset-1"
                      : "rounded-full opacity-50 hover:opacity-80"
                  }
                  aria-pressed={isActive}
                  aria-label={`Filter by decision: ${decision}`}
                >
                  <DecisionBadge decision={decision} />
                </button>
              );
            })}
            {/* Pending (null) decision toggle */}
            <button
              type="button"
              onClick={() => toggleDecision("pending")}
              className={
                currentDecisions.includes("pending")
                  ? "rounded-full ring-2 ring-ring ring-offset-1"
                  : "rounded-full opacity-50 hover:opacity-80"
              }
              aria-pressed={currentDecisions.includes("pending")}
              aria-label="Filter by decision: pending"
            >
              <DecisionBadge decision={null} />
            </button>
          </div>
        </div>
      </div>

      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <Badge variant="secondary">
            {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}{" "}
            active
          </Badge>
          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

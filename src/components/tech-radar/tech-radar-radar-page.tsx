"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  positionBlips,
  resolveCollisions,
  type TechRadarItem,
} from "@/lib/tech-radar/radar-utils";
import { TechRadarChart } from "./tech-radar-chart";
import { RadarLegend } from "./radar-legend";

interface TechRadarRadarPageProps {
  items: TechRadarItem[];
}

export function TechRadarRadarPage({ items }: TechRadarRadarPageProps) {
  const router = useRouter();
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  const blips = useMemo(() => {
    const positioned = positionBlips(items);
    return resolveCollisions(positioned);
  }, [items]);

  const handleBlipClick = useCallback(
    (id: number) => {
      router.push(`/tech-radar/${id}`);
    },
    [router],
  );

  const handleBlipHover = useCallback((id: number | null) => {
    setHighlightedId(id);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 flex justify-center">
        <TechRadarChart
          items={items}
          highlightedId={highlightedId}
          onBlipClick={handleBlipClick}
          onBlipHover={handleBlipHover}
        />
      </div>
      <div className="w-full shrink-0 lg:w-80">
        <RadarLegend
          blips={blips}
          highlightedId={highlightedId}
          onBlipHighlight={handleBlipHover}
          onBlipClick={handleBlipClick}
        />
      </div>
    </div>
  );
}

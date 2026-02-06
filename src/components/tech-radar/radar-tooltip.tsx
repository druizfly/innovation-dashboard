"use client";

import { type RadarBlip } from "@/lib/tech-radar/radar-utils";

interface RadarTooltipProps {
  blip: RadarBlip | null;
  position: { x: number; y: number } | null;
}

export function RadarTooltip({ blip, position }: RadarTooltipProps) {
  if (!blip || !position) return null;

  return (
    <div
      className="bg-popover text-popover-foreground pointer-events-none absolute z-50 max-w-[250px] rounded-md border px-3 py-2 shadow-md"
      style={{
        left: position.x,
        top: position.y - 12,
        transform: "translate(-50%, -100%)",
      }}
      role="tooltip"
    >
      <p className="text-sm font-semibold">{blip.technologyName}</p>
      {blip.description && (
        <p className="text-muted-foreground mt-1 text-xs line-clamp-3">
          {blip.description}
        </p>
      )}
      <div
        className="bg-popover absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r"
      />
    </div>
  );
}

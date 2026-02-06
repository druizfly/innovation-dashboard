"use client";

import {
  QUADRANT_ORDER,
  RING_ORDER,
  QUADRANT_CONFIG,
  RING_CONFIG,
  type RadarBlip,
} from "@/lib/tech-radar/radar-utils";

interface RadarLegendProps {
  blips: RadarBlip[];
  highlightedId?: number | null;
  onBlipHighlight?: (id: number | null) => void;
  onBlipClick?: (id: number) => void;
}

export function RadarLegend({
  blips,
  highlightedId,
  onBlipHighlight,
  onBlipClick,
}: RadarLegendProps) {
  // Group blips by quadrant → ring
  const grouped = new Map<
    string,
    Map<string, RadarBlip[]>
  >();

  for (const quadrant of QUADRANT_ORDER) {
    const ringMap = new Map<string, RadarBlip[]>();
    for (const ring of RING_ORDER) {
      ringMap.set(ring, []);
    }
    grouped.set(quadrant, ringMap);
  }

  for (const blip of blips) {
    const ringMap = grouped.get(blip.quadrant);
    if (ringMap) {
      const ringBlips = ringMap.get(blip.category);
      if (ringBlips) {
        ringBlips.push(blip);
      }
    }
  }

  return (
    <nav aria-label="Technology Radar legend" className="overflow-y-auto max-h-[600px] space-y-5">
      {QUADRANT_ORDER.map((quadrantKey) => {
        const quadrant = QUADRANT_CONFIG[quadrantKey];
        const ringMap = grouped.get(quadrantKey);
        if (!ringMap) return null;

        // Skip quadrants with no blips
        const hasBlips = Array.from(ringMap.values()).some((b) => b.length > 0);
        if (!hasBlips) return null;

        return (
          <div key={quadrantKey}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: quadrant.color }}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">{quadrant.label}</span>
            </div>

            {RING_ORDER.map((ringKey) => {
              const ring = RING_CONFIG[ringKey];
              const ringBlips = ringMap.get(ringKey);
              if (!ringBlips || ringBlips.length === 0) return null;

              return (
                <div key={ringKey} className="mb-2 ml-5">
                  <p className="text-muted-foreground mb-1 text-[10px] font-semibold uppercase tracking-wider">
                    {ring.label}
                  </p>
                  <div className="space-y-0.5">
                    {ringBlips.map((blip) => {
                      const isHighlighted = highlightedId === blip.id;

                      return (
                        <button
                          key={blip.id}
                          type="button"
                          className={`flex w-full items-center gap-2 rounded px-1.5 py-0.5 text-left text-sm transition-colors hover:bg-muted ${
                            isHighlighted ? "bg-muted font-medium" : ""
                          }`}
                          aria-label={`${blip.technologyName} — ${ring.label} ring`}
                          onClick={() => {
                            if (onBlipHighlight) {
                              onBlipHighlight(isHighlighted ? null : blip.id);
                            }
                          }}
                          onDoubleClick={() => {
                            if (onBlipClick) {
                              onBlipClick(blip.id);
                            }
                          }}
                        >
                          <span
                            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                            style={{ backgroundColor: ring.color }}
                          >
                            {blip.number}
                          </span>
                          <span className="truncate">{blip.technologyName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

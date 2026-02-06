"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import {
  RADAR_SIZE,
  CENTER,
  RING_RADII,
  RING_ORDER,
  RING_CONFIG,
  QUADRANT_ORDER,
  QUADRANT_CONFIG,
  positionBlips,
  resolveCollisions,
  type RadarBlip,
  type TechRadarItem,
} from "@/lib/tech-radar/radar-utils";
import { RadarTooltip } from "./radar-tooltip";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TechRadarChartProps {
  items: TechRadarItem[];
  highlightedId?: number | null;
  onBlipClick?: (id: number) => void;
  onBlipHover?: (id: number | null) => void;
}

// ─── Ring fill colors (very subtle) ─────────────────────────────────────────

const RING_FILLS = {
  adopt: "rgba(16, 185, 129, 0.06)",
  explore: "rgba(59, 130, 246, 0.06)",
  consolidate: "rgba(249, 115, 22, 0.06)",
  avoid: "rgba(239, 68, 68, 0.06)",
} as const;

// ─── Component ──────────────────────────────────────────────────────────────

export function TechRadarChart({
  items,
  highlightedId,
  onBlipClick,
  onBlipHover,
}: TechRadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredBlip, setHoveredBlip] = useState<RadarBlip | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const blips = useMemo(() => {
    const positioned = positionBlips(items);
    return resolveCollisions(positioned);
  }, [items]);

  const handleMouseEnter = useCallback(
    (blip: RadarBlip, event: React.MouseEvent) => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
      setHoveredBlip(blip);
      onBlipHover?.(blip.id);
    },
    [onBlipHover],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!hoveredBlip) return;
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      }
    },
    [hoveredBlip],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredBlip(null);
    setTooltipPos(null);
    onBlipHover?.(null);
  }, [onBlipHover]);

  const handleClick = useCallback(
    (id: number) => {
      onBlipClick?.(id);
    },
    [onBlipClick],
  );

  return (
    <div ref={containerRef} className="relative w-full max-w-[700px]">
      <svg
        viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
        className="h-auto w-full"
        aria-label="Technology Radar chart"
        role="img"
        onMouseMove={handleMouseMove}
      >
        {/* Ring backgrounds — outermost first so inner rings paint on top */}
        {[...RING_ORDER].reverse().map((ringKey) => {
          const ring = RING_CONFIG[ringKey];
          return (
            <circle
              key={`ring-bg-${ringKey}`}
              cx={CENTER.x}
              cy={CENTER.y}
              r={ring.outerRadius}
              fill={RING_FILLS[ringKey]}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          );
        })}

        {/* Quadrant dividers */}
        <line
          x1={CENTER.x}
          y1={CENTER.y - RING_RADII[3]}
          x2={CENTER.x}
          y2={CENTER.y + RING_RADII[3]}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        <line
          x1={CENTER.x - RING_RADII[3]}
          y1={CENTER.y}
          x2={CENTER.x + RING_RADII[3]}
          y2={CENTER.y}
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {/* Ring labels along top-right diagonal */}
        {RING_ORDER.map((ringKey) => {
          const ring = RING_CONFIG[ringKey];
          const midRadius = (ring.innerRadius + ring.outerRadius) / 2;
          const offset = midRadius * Math.cos(Math.PI / 4);
          return (
            <text
              key={`ring-label-${ringKey}`}
              x={CENTER.x + offset}
              y={CENTER.y - offset}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[11px] font-medium uppercase"
              style={{ fontSize: 11 }}
            >
              {ring.label}
            </text>
          );
        })}

        {/* Quadrant labels */}
        {QUADRANT_ORDER.map((quadrantKey) => {
          const q = QUADRANT_CONFIG[quadrantKey];
          const midAngle = (q.startAngle + q.endAngle) / 2;
          const labelRadius = RING_RADII[3] * 0.55;
          const angleRad = ((midAngle - 90) * Math.PI) / 180;
          const lx = CENTER.x + labelRadius * Math.cos(angleRad);
          const ly = CENTER.y + labelRadius * Math.sin(angleRad);
          return (
            <text
              key={`quad-label-${quadrantKey}`}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-muted-foreground/50 text-[13px] font-semibold"
              style={{ fontSize: 13 }}
            >
              {q.label}
            </text>
          );
        })}

        {/* Blips */}
        {blips.map((blip) => {
          const ringConfig =
            RING_CONFIG[blip.category as keyof typeof RING_CONFIG];
          const isHighlighted = highlightedId == null || highlightedId === blip.id;
          const fillColor = ringConfig?.color ?? "#6b7280";

          return (
            <g
              key={blip.id}
              style={{
                cursor: "pointer",
                opacity: isHighlighted ? 1 : 0.3,
                transition: "opacity 150ms ease",
              }}
              onMouseEnter={(e) => handleMouseEnter(blip, e)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(blip.id)}
              role="button"
              tabIndex={0}
              aria-label={`${blip.technologyName} — ${blip.category}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(blip.id);
                }
              }}
            >
              <circle
                cx={blip.x}
                cy={blip.y}
                r={12}
                fill={fillColor}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={blip.x}
                y={blip.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {blip.number}
              </text>
            </g>
          );
        })}
      </svg>

      <RadarTooltip blip={hoveredBlip} position={tooltipPos} />
    </div>
  );
}

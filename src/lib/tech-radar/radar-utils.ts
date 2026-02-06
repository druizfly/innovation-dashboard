// ─── Constants ──────────────────────────────────────────────────────────────

export const RADAR_SIZE = 800;
export const CENTER = { x: 400, y: 400 } as const;
export const RING_RADII = [100, 200, 300, 380] as const;
export const MIN_DISTANCE = 28;

export const QUADRANT_ORDER = [
  "languages-frameworks",
  "tools",
  "platforms",
  "techniques",
] as const;

export const RING_ORDER = [
  "adopt",
  "explore",
  "consolidate",
  "avoid",
] as const;

export const QUADRANT_CONFIG = {
  "languages-frameworks": {
    label: "Languages & Frameworks",
    startAngle: 270,
    endAngle: 360,
    color: "#8b5cf6", // violet-500
  },
  tools: {
    label: "Tools",
    startAngle: 0,
    endAngle: 90,
    color: "#14b8a6", // teal-500
  },
  platforms: {
    label: "Platforms",
    startAngle: 90,
    endAngle: 180,
    color: "#f59e0b", // amber-500
  },
  techniques: {
    label: "Techniques",
    startAngle: 180,
    endAngle: 270,
    color: "#ec4899", // pink-500
  },
} as const;

export const RING_CONFIG = {
  adopt: {
    label: "Adopt",
    innerRadius: 0,
    outerRadius: 100,
    color: "#10b981", // emerald-500
  },
  explore: {
    label: "Explore",
    innerRadius: 100,
    outerRadius: 200,
    color: "#3b82f6", // blue-500
  },
  consolidate: {
    label: "Consolidate",
    innerRadius: 200,
    outerRadius: 300,
    color: "#f97316", // orange-500
  },
  avoid: {
    label: "Avoid",
    innerRadius: 300,
    outerRadius: 380,
    color: "#ef4444", // red-500
  },
} as const;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RadarBlip {
  id: number;
  technologyName: string;
  category: string;
  quadrant: string;
  description: string | null;
  x: number;
  y: number;
  number: number;
}

export interface TechRadarItem {
  id: number;
  technologyName: string;
  category: string;
  quadrant: string;
  description: string | null;
}

// TODO: Future feature — movement indicators (arrows for ring changes between radar snapshots)

// ─── Pure Functions ─────────────────────────────────────────────────────────

/**
 * Convert polar coordinates to SVG cartesian coordinates.
 * 0° = up (top), 90° = right, 180° = down, 270° = left.
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  // Convert to math convention: 0° = up means we offset by -90°
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/**
 * Simple seeded pseudo-random number generator (mulberry32).
 * Returns a function that produces deterministic values in [0, 1).
 */
function seededRandom(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Position blips on the radar based on their quadrant and ring.
 * Assigns x, y coordinates and sequential numbers.
 * Positioning is deterministic — same input always produces same output.
 */
export function positionBlips(items: TechRadarItem[]): RadarBlip[] {
  if (items.length === 0) return [];

  const blips: RadarBlip[] = [];
  let globalNumber = 0;

  // Process quadrants in order, then rings within each quadrant
  for (const quadrantKey of QUADRANT_ORDER) {
    for (const ringKey of RING_ORDER) {
      const quadrant =
        QUADRANT_CONFIG[quadrantKey as keyof typeof QUADRANT_CONFIG];
      const ring = RING_CONFIG[ringKey as keyof typeof RING_CONFIG];

      if (!quadrant || !ring) continue;

      const itemsInSegment = items.filter(
        (item) => item.quadrant === quadrantKey && item.category === ringKey,
      );

      // Sort by name for deterministic ordering
      itemsInSegment.sort((a, b) =>
        a.technologyName.localeCompare(b.technologyName),
      );

      for (let i = 0; i < itemsInSegment.length; i++) {
        const item = itemsInSegment[i];
        globalNumber++;

        // Seed based on quadrant, ring, and index for deterministic placement
        const seed =
          QUADRANT_ORDER.indexOf(quadrantKey) * 1000 +
          RING_ORDER.indexOf(ringKey) * 100 +
          i;
        const rand = seededRandom(seed);

        // Calculate position within the segment
        const radiusPadding = 15;
        const innerR = ring.innerRadius + radiusPadding;
        const outerR = ring.outerRadius - radiusPadding;
        const radius = innerR + rand() * (outerR - innerR);

        const anglePadding = 5;
        const startA = quadrant.startAngle + anglePadding;
        const endA = quadrant.endAngle - anglePadding;
        const angle = startA + rand() * (endA - startA);

        const { x, y } = polarToCartesian(CENTER.x, CENTER.y, radius, angle);

        blips.push({
          id: item.id,
          technologyName: item.technologyName,
          category: item.category,
          quadrant: item.quadrant,
          description: item.description,
          x,
          y,
          number: globalNumber,
        });
      }
    }
  }

  return blips;
}

/**
 * Iteratively push apart blips that are closer than minDistance.
 * Preserves all blips — only adjusts x,y coordinates.
 */
export function resolveCollisions(
  blips: RadarBlip[],
  minDistance: number = MIN_DISTANCE,
): RadarBlip[] {
  if (blips.length <= 1) return blips;

  // Work on a copy to keep function pure
  const result = blips.map((b) => ({ ...b }));
  const maxIterations = 50;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let hasCollision = false;

    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dx = result[j].x - result[i].x;
        const dy = result[j].y - result[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          hasCollision = true;
          const overlap = minDistance - dist;
          const pushDistance = overlap / 2 + 1;

          // Normalize direction; if same position, push in arbitrary direction
          let nx: number, ny: number;
          if (dist === 0) {
            nx = 1;
            ny = 0;
          } else {
            nx = dx / dist;
            ny = dy / dist;
          }

          result[i].x -= nx * pushDistance;
          result[i].y -= ny * pushDistance;
          result[j].x += nx * pushDistance;
          result[j].y += ny * pushDistance;
        }
      }
    }

    if (!hasCollision) break;
  }

  return result;
}

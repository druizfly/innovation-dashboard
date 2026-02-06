import { describe, it, expect } from "vitest";
import {
  polarToCartesian,
  positionBlips,
  resolveCollisions,
  CENTER,
  MIN_DISTANCE,
  type TechRadarItem,
} from "@/lib/tech-radar/radar-utils";

// ─── polarToCartesian ──────────────────────────────────────────────────────

describe("polarToCartesian", () => {
  const cx = 400;
  const cy = 400;
  const r = 100;

  it("0° → top of circle", () => {
    const { x, y } = polarToCartesian(cx, cy, r, 0);
    expect(x).toBeCloseTo(cx);
    expect(y).toBeCloseTo(cy - r);
  });

  it("90° → right", () => {
    const { x, y } = polarToCartesian(cx, cy, r, 90);
    expect(x).toBeCloseTo(cx + r);
    expect(y).toBeCloseTo(cy);
  });

  it("180° → bottom", () => {
    const { x, y } = polarToCartesian(cx, cy, r, 180);
    expect(x).toBeCloseTo(cx);
    expect(y).toBeCloseTo(cy + r);
  });

  it("270° → left", () => {
    const { x, y } = polarToCartesian(cx, cy, r, 270);
    expect(x).toBeCloseTo(cx - r);
    expect(y).toBeCloseTo(cy);
  });
});

// ─── positionBlips ────────────────────────────────────────────────────────

describe("positionBlips", () => {
  it("returns empty array for empty input", () => {
    expect(positionBlips([])).toEqual([]);
  });

  it("assigns x, y, and number=1 for a single blip", () => {
    const items: TechRadarItem[] = [
      {
        id: 1,
        technologyName: "React",
        category: "adopt",
        quadrant: "languages-frameworks",
        description: null,
      },
    ];

    const blips = positionBlips(items);
    expect(blips).toHaveLength(1);
    expect(blips[0].number).toBe(1);
    expect(typeof blips[0].x).toBe("number");
    expect(typeof blips[0].y).toBe("number");
  });

  it("assigns sequential numbers to multiple blips", () => {
    const items: TechRadarItem[] = [
      { id: 1, technologyName: "React", category: "adopt", quadrant: "languages-frameworks", description: null },
      { id: 2, technologyName: "Docker", category: "adopt", quadrant: "tools", description: null },
      { id: 3, technologyName: "AWS", category: "explore", quadrant: "platforms", description: null },
    ];

    const blips = positionBlips(items);
    expect(blips).toHaveLength(3);

    const numbers = blips.map((b) => b.number).sort((a, b) => a - b);
    expect(numbers).toEqual([1, 2, 3]);
  });

  it("places blips within expected bounds", () => {
    const items: TechRadarItem[] = [
      { id: 1, technologyName: "React", category: "adopt", quadrant: "languages-frameworks", description: null },
    ];

    const blips = positionBlips(items);
    const blip = blips[0];

    // Blip should be somewhere within the SVG canvas (0..800)
    expect(blip.x).toBeGreaterThan(0);
    expect(blip.x).toBeLessThan(800);
    expect(blip.y).toBeGreaterThan(0);
    expect(blip.y).toBeLessThan(800);

    // Adopt ring (innerRadius=0, outerRadius=100) — distance from center should be within ring
    const dx = blip.x - CENTER.x;
    const dy = blip.y - CENTER.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // With padding of 15, range is [15, 85]
    expect(dist).toBeGreaterThanOrEqual(15);
    expect(dist).toBeLessThanOrEqual(85);
  });

  it("is deterministic — same input produces same output", () => {
    const items: TechRadarItem[] = [
      { id: 1, technologyName: "React", category: "adopt", quadrant: "languages-frameworks", description: null },
      { id: 2, technologyName: "Docker", category: "adopt", quadrant: "tools", description: null },
    ];

    const first = positionBlips(items);
    const second = positionBlips(items);

    expect(first).toEqual(second);
  });
});

// ─── resolveCollisions ────────────────────────────────────────────────────

describe("resolveCollisions", () => {
  it("leaves non-overlapping blips unchanged", () => {
    const blips = [
      { id: 1, technologyName: "A", category: "adopt", quadrant: "tools", description: null, x: 100, y: 100, number: 1 },
      { id: 2, technologyName: "B", category: "adopt", quadrant: "tools", description: null, x: 200, y: 200, number: 2 },
    ];

    const result = resolveCollisions(blips);
    expect(result[0].x).toBe(100);
    expect(result[0].y).toBe(100);
    expect(result[1].x).toBe(200);
    expect(result[1].y).toBe(200);
  });

  it("pushes overlapping blips apart to at least MIN_DISTANCE", () => {
    const blips = [
      { id: 1, technologyName: "A", category: "adopt", quadrant: "tools", description: null, x: 100, y: 100, number: 1 },
      { id: 2, technologyName: "B", category: "adopt", quadrant: "tools", description: null, x: 105, y: 100, number: 2 },
    ];

    const result = resolveCollisions(blips);
    const dx = result[1].x - result[0].x;
    const dy = result[1].y - result[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    expect(dist).toBeGreaterThanOrEqual(MIN_DISTANCE);
  });

  it("preserves blip count", () => {
    const blips = [
      { id: 1, technologyName: "A", category: "adopt", quadrant: "tools", description: null, x: 100, y: 100, number: 1 },
      { id: 2, technologyName: "B", category: "adopt", quadrant: "tools", description: null, x: 100, y: 100, number: 2 },
      { id: 3, technologyName: "C", category: "adopt", quadrant: "tools", description: null, x: 100, y: 100, number: 3 },
    ];

    const result = resolveCollisions(blips);
    expect(result).toHaveLength(3);
  });
});

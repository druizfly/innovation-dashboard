import { describe, it, expect } from "vitest";

describe("Test Setup", () => {
  it("should run a basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should have access to path aliases", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("foo", "bar")).toBe("foo bar");
  });
});

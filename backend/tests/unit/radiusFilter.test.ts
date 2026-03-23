import { describe, expect, it } from "vitest";
import { filterByRadius } from "../../src/services/distanceService";

describe("radius filter", () => {
  it("includes candidates at <=1000m boundary", () => {
    const candidates = [
      { sourceUrl: "https://example.com/a", lat: 22.3, lng: 114.1, name: "A" },
      { sourceUrl: "https://example.com/b", lat: 22.31, lng: 114.11, name: "B" },
    ];
    const filtered = filterByRadius(22.3, 114.1, 1000, candidates);
    expect(filtered.length).toBeGreaterThanOrEqual(1);
  });
});

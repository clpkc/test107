import { describe, expect, it } from "vitest";
import { calculateDistanceMeters } from "../../src/services/distanceService";

describe("distanceService", () => {
  it("returns 0 for same coordinates", () => {
    expect(calculateDistanceMeters(22.3, 114.1, 22.3, 114.1)).toBe(0);
  });

  it("calculates realistic distance", () => {
    const meters = calculateDistanceMeters(22.2819, 114.1586, 22.2840, 114.1600);
    expect(meters).toBeGreaterThan(100);
    expect(meters).toBeLessThan(400);
  });
});

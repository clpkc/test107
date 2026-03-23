import { describe, expect, it } from "vitest";
import { pickUniform } from "../../src/services/randomService";

describe("random service", () => {
  it("supports deterministic seeded-like RNG", () => {
    const items = [
      { sourceUrl: "a", canonicalId: "a", distanceMeters: 1 },
      { sourceUrl: "b", canonicalId: "b", distanceMeters: 2 },
    ];
    const picked = pickUniform(items as any, () => 0.9);
    expect(picked?.canonicalId).toBe("b");
  });
});

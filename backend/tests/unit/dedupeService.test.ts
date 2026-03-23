import { describe, expect, it } from "vitest";
import { canonicalizeUrl, dedupeCandidates } from "../../src/services/dedupeService";

describe("dedupe service", () => {
  it("canonicalizes URL by removing query and fragment", () => {
    const key = canonicalizeUrl("https://www.openrice.com/restaurant/abc/?x=1#frag");
    expect(key).toBe("https://www.openrice.com/restaurant/abc");
  });

  it("deduplicates by canonical URL", () => {
    const deduped = dedupeCandidates([
      { sourceUrl: "https://www.openrice.com/r/abc?x=1", name: "A" },
      { sourceUrl: "https://www.openrice.com/r/abc?x=2", name: "A2" },
    ]);
    expect(deduped).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";
import { normalizeCacheKey } from "../../src/services/cacheService";

describe("cache key normalization", () => {
  it("produces same key for equivalent inputs", () => {
    const a = normalizeCacheKey("https://www.openrice.com/zh/hongkong?b=2&a=1");
    const b = normalizeCacheKey("https://www.openrice.com/zh/hongkong?a=1&b=2");
    expect(a).toBe(b);
  });
});

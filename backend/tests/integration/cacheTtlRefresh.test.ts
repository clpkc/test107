import { describe, expect, it, vi } from "vitest";
import { OpenRiceRestaurantProvider } from "../../src/providers/OpenRiceRestaurantProvider";
import { CacheService } from "../../src/services/cacheService";

describe("cache TTL refresh", () => {
  it("uses cache before TTL and refreshes after TTL", async () => {
    let calls = 0;
    const base = 1_000_000;
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValue(base);

    const provider = new OpenRiceRestaurantProvider({
      baseUrl: "https://www.openrice.com",
      cache: new CacheService<string>(),
      fetcher: async () => {
        calls += 1;
        return new Response('<div class="restaurant"><a href="/restaurant/abc">A</a></div>', { status: 200 });
      },
    });

    await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });
    await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });
    expect(calls).toBe(1);

    nowSpy.mockReturnValue(base + 10 * 60 * 1000 + 1);
    await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });
    expect(calls).toBe(2);

    nowSpy.mockRestore();
  });
});

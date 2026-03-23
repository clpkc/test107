import { describe, expect, it } from "vitest";
import { OpenRiceRestaurantProvider } from "../../src/providers/OpenRiceRestaurantProvider";
import { RateLimitService } from "../../src/services/rateLimitService";

describe("retry limiter interaction", () => {
  it("retries never bypass global rate limiter", async () => {
    const limiter = new RateLimitService({ perMinute: 1, burstCount: 1, burstWindowMs: 60_000 });
    let calls = 0;
    const provider = new OpenRiceRestaurantProvider({
      baseUrl: "https://www.openrice.com",
      limiter,
      fetcher: async () => {
        calls += 1;
        return new Response("err", { status: 500 });
      },
    });

    await expect(provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 })).rejects.toThrow();
    expect(calls).toBe(1);
  });
});

import { describe, expect, it } from "vitest";
import { OpenRiceRestaurantProvider } from "../../src/providers/OpenRiceRestaurantProvider";

describe("retry per-click cap", () => {
  it("retries on 429/5xx never exceed per-click attempt cap", async () => {
    let calls = 0;
    const provider = new OpenRiceRestaurantProvider({
      baseUrl: "https://www.openrice.com",
      fetcher: async () => {
        calls += 1;
        return new Response("err", { status: 429 });
      },
    });

    await expect(provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 })).rejects.toThrow();
    expect(calls).toBeLessThanOrEqual(3);
  });
});

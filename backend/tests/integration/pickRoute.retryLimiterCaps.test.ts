import { describe, expect, it } from "vitest";
import { OpenRiceRestaurantProvider } from "../../src/providers/OpenRiceRestaurantProvider";

describe("retry + limiter integration", () => {
  it("429 then 200 stays within per-click cap and respects limiter", async () => {
    let calls = 0;
    const provider = new OpenRiceRestaurantProvider({
      baseUrl: "https://www.openrice.com",
      fetcher: async () => {
        calls += 1;
        if (calls === 1) return new Response("err", { status: 429 });
        return new Response(
          '<div class="restaurant"><a href="/restaurant/abc">A</a><div class="address">HK</div></div>',
          { status: 200 },
        );
      },
    });

    const result = await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(calls).toBeLessThanOrEqual(3);
  });
});

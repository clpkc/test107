import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "./testApp";

describe("pick route success", () => {
  it("returns one restaurant on success", async () => {
    const provider = {
      async getCandidates() {
        return [
          {
            sourceUrl: "https://www.openrice.com/r/a",
            name: "Restaurant A",
            address: "HK",
            cuisine: ["Cafe"],
            priceRange: "$101-200",
            photos: ["https://img"],
            lat: 22.3,
            lng: 114.1,
          },
        ];
      },
    };
    const app = buildTestApp(provider as any, () => 0);

    const res = await request(app).get("/api/pick?lat=22.3&lng=114.1&radius=1000");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Restaurant A");
  });
});

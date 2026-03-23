import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "../integration/testApp";

const provider = {
  async getCandidates() {
    return [
      {
        sourceUrl: "https://www.openrice.com/r/a",
        canonicalId: "https://www.openrice.com/r/a",
        name: "ABC",
        address: "addr",
        cuisine: ["Cafe"],
        priceRange: "$101-200",
        photos: ["https://img"],
        lat: 22.3,
        lng: 114.1,
      },
    ];
  },
};

describe("pick API contract", () => {
  it("returns required response fields", async () => {
    const app = buildTestApp(provider as any, () => 0);
    const res = await request(app).get("/api/pick?lat=22.3&lng=114.1&radius=1000");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        address: expect.any(String),
        cuisine: expect.any(Array),
        priceRange: expect.any(String),
        photos: expect.any(Array),
        sourceUrl: expect.any(String),
        distanceMeters: expect.any(Number),
      }),
    );
  });
});

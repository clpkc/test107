import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "./testApp";

describe("pick route no-results", () => {
  it("returns 404 when nothing within radius", async () => {
    const provider = {
      async getCandidates() {
        return [];
      },
    };
    const app = buildTestApp(provider as any);

    const res = await request(app).get("/api/pick?lat=22.3&lng=114.1&radius=1000");
    expect(res.status).toBe(404);
    expect(res.body.code).toBe("no_results");
  });
});

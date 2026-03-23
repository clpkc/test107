import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "./testApp";

describe("pick route source unavailable", () => {
  it("returns 502 for source unavailable", async () => {
    const provider = {
      async getCandidates() {
        throw new Error("source_down");
      },
    };
    const app = buildTestApp(provider as any);

    const res = await request(app).get("/api/pick?lat=22.3&lng=114.1&radius=1000");
    expect(res.status).toBe(502);
    expect(res.body.code).toBe("source_unavailable");
  });
});

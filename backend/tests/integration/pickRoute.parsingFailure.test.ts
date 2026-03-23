import request from "supertest";
import { describe, expect, it } from "vitest";
import { buildTestApp } from "./testApp";
import { PickError } from "../../src/services/pickService";

describe("pick route parsing failure", () => {
  it("returns 503 for parsing failure", async () => {
    const provider = {
      async getCandidates() {
        throw new PickError("parsing_failure", "parse fail");
      },
    };
    const app = buildTestApp(provider as any);

    const res = await request(app).get("/api/pick?lat=22.3&lng=114.1&radius=1000");
    expect(res.status).toBe(503);
    expect(res.body.code).toBe("parsing_failure");
  });
});

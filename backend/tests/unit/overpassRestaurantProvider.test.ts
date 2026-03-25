import { describe, expect, it, vi } from "vitest";
import { OverpassRestaurantProvider } from "../../src/providers/OverpassRestaurantProvider";

function createJsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("OverpassRestaurantProvider", () => {
  it("retries transient failures on the same endpoint", async () => {
    const fetcher = vi.fn()
      .mockRejectedValueOnce(new Error("fetch failed"))
      .mockResolvedValueOnce(createJsonResponse({ elements: [] }));

    const provider = new OverpassRestaurantProvider({
      apiUrls: ["https://primary.example/api/interpreter"],
      fetcher,
    });

    const result = await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });

    expect(result).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://primary.example/api/interpreter",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("falls back to the next endpoint after repeated transient failures", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(createJsonResponse({}, 502))
      .mockResolvedValueOnce(createJsonResponse({}, 502))
      .mockResolvedValueOnce(createJsonResponse({}, 502))
      .mockResolvedValueOnce(createJsonResponse({
        elements: [
          {
            type: "node",
            id: 7,
            lat: 22.3,
            lon: 114.1,
            tags: { name: "Cafe", cuisine: "western;coffee" },
          },
        ],
      }));

    const provider = new OverpassRestaurantProvider({
      apiUrls: [
        "https://primary.example/api/interpreter",
        "https://secondary.example/api/interpreter",
      ],
      fetcher,
    });

    const result = await provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 });

    expect(result).toHaveLength(1);
    expect(result[0]?.canonicalId).toBe("osm:node:7");
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(fetcher).toHaveBeenLastCalledWith(
      "https://secondary.example/api/interpreter",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws when every endpoint fails transiently", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("fetch failed"));

    const provider = new OverpassRestaurantProvider({
      apiUrls: [
        "https://primary.example/api/interpreter",
        "https://secondary.example/api/interpreter",
      ],
      fetcher,
    });

    await expect(
      provider.getCandidates({ lat: 22.3, lng: 114.1, radius: 1000, perClickCap: 3 }),
    ).rejects.toThrow("fetch failed");
    expect(fetcher).toHaveBeenCalledTimes(6);
  });
});
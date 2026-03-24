import { describe, expect, it, vi } from "vitest";
import { PickService } from "../../src/services/pickService";

describe("pick service metadata enrichment", () => {
  it("applies enriched address, cuisine, and price range when available", async () => {
    const provider = {
      async getCandidates() {
        return [
          {
            sourceUrl: "https://www.openstreetmap.org/node/1",
            canonicalId: "osm:node:1",
            name: "Cafe A",
            lat: 22.3,
            lng: 114.1,
            photos: [],
          },
        ];
      },
    };

    const reverseGeocode = vi.fn(async () => null);
    const metadataEnricher = {
      enrich: vi.fn(async () => ({
        address: "1 Test Street, Hung Hom",
        cuisine: ["japanese"],
        priceRange: "$$$",
      })),
    };

    const service = new PickService(provider as any, () => 0, reverseGeocode, metadataEnricher);
    const result = await service.pick({ lat: 22.3, lng: 114.1, radius: 1000 });

    expect(metadataEnricher.enrich).toHaveBeenCalledTimes(1);
    expect(reverseGeocode).not.toHaveBeenCalled();
    expect(result.address).toBe("1 Test Street, Hung Hom");
    expect(result.cuisine).toEqual(["japanese"]);
    expect(result.priceRange).toBe("$$$");
  });

  it("preserves original values when enrichment yields nothing", async () => {
    const provider = {
      async getCandidates() {
        return [
          {
            sourceUrl: "https://www.openstreetmap.org/node/1",
            canonicalId: "osm:node:1",
            name: "Cafe A",
            address: "Existing Address",
            cuisine: ["cafe"],
            priceRange: "$$",
            lat: 22.3,
            lng: 114.1,
            photos: [],
          },
        ];
      },
    };

    const metadataEnricher = {
      enrich: vi.fn(async () => ({})),
    };

    const service = new PickService(provider as any, () => 0, async () => null, metadataEnricher);
    const result = await service.pick({ lat: 22.3, lng: 114.1, radius: 1000 });

    expect(result.address).toBe("Existing Address");
    expect(result.cuisine).toEqual(["cafe"]);
    expect(result.priceRange).toBe("$$");
  });
});
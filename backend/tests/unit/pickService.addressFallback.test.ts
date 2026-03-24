import { describe, expect, it, vi } from "vitest";
import { PickService } from "../../src/services/pickService";

describe("pick service address fallback", () => {
  it("uses reverse geocode when address is missing", async () => {
    const provider = {
      async getCandidates() {
        return [
          {
            sourceUrl: "https://www.openstreetmap.org/node/1",
            canonicalId: "osm:node:1",
            name: "Cafe A",
            lat: 22.3078342,
            lng: 114.1852956,
            cuisine: undefined,
            priceRange: undefined,
            photos: [],
          },
        ];
      },
    };

    const reverseGeocode = vi.fn(async () => "78 Wuhu Street, Hung Hom");
    const service = new PickService(provider as any, () => 0, reverseGeocode);
    const result = await service.pick({ lat: 22.3078, lng: 114.1853, radius: 1000 });

    expect(reverseGeocode).toHaveBeenCalledTimes(1);
    expect(result.address).toBe("78 Wuhu Street, Hung Hom");
  });

  it("does not call reverse geocode when address already exists", async () => {
    const provider = {
      async getCandidates() {
        return [
          {
            sourceUrl: "https://www.openstreetmap.org/node/1",
            canonicalId: "osm:node:1",
            name: "Cafe A",
            address: "Existing Address",
            lat: 22.3078342,
            lng: 114.1852956,
            cuisine: undefined,
            priceRange: undefined,
            photos: [],
          },
        ];
      },
    };

    const reverseGeocode = vi.fn(async () => "78 Wuhu Street, Hung Hom");
    const service = new PickService(provider as any, () => 0, reverseGeocode);
    const result = await service.pick({ lat: 22.3078, lng: 114.1853, radius: 1000 });

    expect(reverseGeocode).not.toHaveBeenCalled();
    expect(result.address).toBe("Existing Address");
  });
});
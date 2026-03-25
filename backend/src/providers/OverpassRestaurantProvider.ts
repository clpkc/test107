import type { RestaurantCandidate } from "../models/restaurant";
import type { ProviderContext, RestaurantProvider } from "./RestaurantProvider";
import { retryWithBackoff } from "../services/retryService";

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export class OverpassRestaurantProvider implements RestaurantProvider {
  private readonly apiUrls: string[];
  private readonly fetcher: (url: string, opts?: RequestInit) => Promise<Response>;

  constructor(opts?: {
    apiUrl?: string;
    apiUrls?: string[];
    fetcher?: (url: string, opts?: RequestInit) => Promise<Response>;
  }) {
    this.apiUrls = (opts?.apiUrls && opts.apiUrls.length > 0
      ? opts.apiUrls
      : opts?.apiUrl
        ? [opts.apiUrl]
        : [
            "https://overpass-api.de/api/interpreter",
            "https://overpass.private.coffee/api/interpreter",
          ]).map((url) => url.trim()).filter(Boolean);
    this.fetcher = opts?.fetcher ?? ((url, o) => fetch(url, o));
  }

  async getCandidates(ctx: ProviderContext): Promise<RestaurantCandidate[]> {
    const { lat, lng, radius } = ctx;

    const query = [
      "[out:json][timeout:15];",
      "(",
      `  node["amenity"="restaurant"](around:${radius},${lat},${lng});`,
      `  way["amenity"="restaurant"](around:${radius},${lat},${lng});`,
      ");",
      "out center tags;",
    ].join("\n");

    const data = await this.fetchFromAvailableEndpoint(query);

    return data.elements.map((el): RestaurantCandidate => {
      const tags = el.tags ?? {};
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      const name = tags["name"] || tags["name:en"] || undefined;

      // Build an OpenStreetMap link as the canonical URL
      const sourceUrl = `https://www.openstreetmap.org/${el.type}/${el.id}`;

      const cuisine = tags["cuisine"]
        ? tags["cuisine"].split(";").map((s) => s.trim()).filter(Boolean)
        : undefined;

      const address = [
        tags["addr:housenumber"],
        tags["addr:street"],
        tags["addr:city"],
      ]
        .filter(Boolean)
        .join(" ") || tags["addr:full"] || undefined;

      // Detect if restaurant is closed
      const closed =
        name?.includes("(Closed)") ||
        name?.includes("Closed") ||
        tags["disused:amenity"] === "restaurant" ||
        tags["disused"] === "yes";

      // Extract OpenRice URL from OSM tags
      let openriceUrl: string | undefined;
      const website = tags["website"];
      if (website && website.includes("openrice.com")) {
        openriceUrl = website;
      } else {
        const contactWebsite = tags["contact:website"];
        if (contactWebsite && contactWebsite.includes("openrice.com")) {
          openriceUrl = contactWebsite;
        }
      }

      return {
        sourceUrl,
        canonicalId: `osm:${el.type}:${el.id}`,
        name,
        address,
        cuisine,
        priceRange: undefined,
        photos: [],
        lat: elLat,
        lng: elLng,
        closed,
        openriceUrl,
      };
    });
  }

  private async fetchFromAvailableEndpoint(query: string): Promise<OverpassResponse> {
    let lastError: unknown;

    for (const apiUrl of this.apiUrls) {
      try {
        return await retryWithBackoff(
          async () => {
            const response = await this.fetcher(apiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `data=${encodeURIComponent(query)}`,
            });

            if (!response.ok) {
              throw new Error(`overpass_http_${response.status}`);
            }

            return (await response.json()) as OverpassResponse;
          },
          {
            maxRetries: 2,
            shouldRetry: (error) => this.isTransientError(error),
          },
        );
      } catch (error) {
        lastError = error;
        if (!this.isTransientError(error)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error("overpass_unavailable");
  }

  private isTransientError(error: unknown): boolean {
    const message = String((error as Error)?.message || "").toLowerCase();
    return (
      message === "typeerror: fetch failed" ||
      message.includes("fetch failed") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.startsWith("overpass_http_429") ||
      message.startsWith("overpass_http_5")
    );
  }
}

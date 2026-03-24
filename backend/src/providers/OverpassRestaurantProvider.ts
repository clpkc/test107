import type { RestaurantCandidate } from "../models/restaurant";
import type { ProviderContext, RestaurantProvider } from "./RestaurantProvider";

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
  private readonly apiUrl: string;
  private readonly fetcher: (url: string, opts?: RequestInit) => Promise<Response>;

  constructor(opts?: {
    apiUrl?: string;
    fetcher?: (url: string, opts?: RequestInit) => Promise<Response>;
  }) {
    this.apiUrl = opts?.apiUrl ?? "https://overpass-api.de/api/interpreter";
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

    const response = await this.fetcher(this.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`overpass_http_${response.status}`);
    }

    const data = (await response.json()) as OverpassResponse;

    return data.elements.map((el): RestaurantCandidate => {
      const tags = el.tags ?? {};
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;

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

      return {
        sourceUrl,
        canonicalId: `osm:${el.type}:${el.id}`,
        name: tags["name"] || tags["name:en"] || undefined,
        address,
        cuisine,
        priceRange: undefined,
        photos: [],
        lat: elLat,
        lng: elLng,
      };
    });
  }
}

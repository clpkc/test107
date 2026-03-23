import type { RestaurantCandidate } from "../models/restaurant";
import type { ProviderContext, RestaurantProvider } from "./RestaurantProvider";
import { parseOpenRiceListing } from "../parsers/openRiceParser";
import { CacheService, normalizeCacheKey } from "../services/cacheService";
import { RateLimitService } from "../services/rateLimitService";
import { retryWithBackoff } from "../services/retryService";
import { resolveCoordinates, type GeocodeFn } from "../services/coordinateResolver";

interface ProviderDeps {
  baseUrl: string;
  fetcher?: (url: string) => Promise<Response>;
  cache?: CacheService<string>;
  limiter?: RateLimitService;
  geocode?: GeocodeFn;
}

const TEN_MINUTES_MS = 10 * 60 * 1000;

export class OpenRiceRestaurantProvider implements RestaurantProvider {
  private readonly baseUrl: string;
  private readonly fetcher: (url: string) => Promise<Response>;
  private readonly cache: CacheService<string>;
  private readonly limiter: RateLimitService;
  private readonly geocode: GeocodeFn;

  constructor(deps: ProviderDeps) {
    this.baseUrl = deps.baseUrl;
    this.fetcher = deps.fetcher || ((url) => fetch(url));
    this.cache = deps.cache || new CacheService<string>();
    this.limiter =
      deps.limiter || new RateLimitService({ perMinute: 30, burstCount: 5, burstWindowMs: 10_000 });
    this.geocode = deps.geocode || (async () => null);
  }

  async getCandidates(ctx: ProviderContext): Promise<RestaurantCandidate[]> {
    const listUrl = `${this.baseUrl}/zh/hongkong`;
    const html = await this.fetchPageWithPolicy(listUrl, ctx.perClickCap);
    const parsed = parseOpenRiceListing(html, this.baseUrl);

    const enriched: RestaurantCandidate[] = [];
    for (const candidate of parsed) {
      const coords = await resolveCoordinates(html, candidate.address, this.geocode);
      if (!coords) {
        enriched.push(candidate);
        continue;
      }
      enriched.push({ ...candidate, lat: coords.lat, lng: coords.lng });
    }

    return enriched;
  }

  private async fetchPageWithPolicy(url: string, perClickCap: number): Promise<string> {
    const key = normalizeCacheKey(url);
    const fromCache = this.cache.get(key);
    if (fromCache) return fromCache;

    let attempts = 0;
    const html = await retryWithBackoff(
      async () => {
        if (attempts >= perClickCap) {
          throw new Error("per_click_cap_exceeded");
        }
        if (!this.limiter.allow()) {
          throw new Error("global_rate_limited");
        }
        attempts += 1;

        const response = await this.fetcher(url);
        if (!response.ok) {
          throw new Error(`http_${response.status}`);
        }
        return response.text();
      },
      {
        maxRetries: 2,
        shouldRetry: (error) => {
          const message = String((error as Error).message || "");
          return message.startsWith("http_429") || message.startsWith("http_5") || message === "TypeError: fetch failed";
        },
      },
    );

    this.cache.set(key, html, TEN_MINUTES_MS);
    return html;
  }
}

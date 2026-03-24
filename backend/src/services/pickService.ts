import type { PickRequest, PickResponse } from "../models/restaurant";
import { withFallbacks } from "../models/restaurant";
import type { RestaurantProvider } from "../providers/RestaurantProvider";
import { dedupeCandidates } from "./dedupeService";
import { filterByRadius } from "./distanceService";
import { pickUniform, type RandomFn } from "./randomService";
import { reverseGeocodeAddress, type ReverseGeocodeFn } from "./reverseGeocodeService";
import type { RestaurantMetadataEnricher } from "./restaurantMetadataEnricher";

export class PickError extends Error {
  constructor(public readonly code: "no_results" | "source_unavailable" | "parsing_failure" | "rate_limited", message: string) {
    super(message);
  }
}

export class PickService {
  constructor(
    private readonly provider: RestaurantProvider,
    private readonly rng: RandomFn = Math.random,
    private readonly reverseGeocode: ReverseGeocodeFn = async (lat, lng) => {
      if (process.env.NODE_ENV === "test") {
        return null;
      }
      return reverseGeocodeAddress(lat, lng);
    },
    private readonly metadataEnricher?: RestaurantMetadataEnricher,
  ) {}

  async pick(request: PickRequest): Promise<PickResponse> {
    let candidates;
    try {
      candidates = await this.provider.getCandidates({ ...request, perClickCap: 3 });
    } catch (error) {
      if (error instanceof PickError) {
        throw error;
      }
      const message = String((error as Error).message || "");
      if (message.includes("rate_limited") || message.includes("429")) {
        throw new PickError("rate_limited", "Source temporarily rate limited");
      }
      if (message.includes("parse")) {
        throw new PickError("parsing_failure", "Unable to parse source data");
      }
      throw new PickError("source_unavailable", "Source unavailable");
    }

    const deduped = dedupeCandidates(candidates);
    const notClosed = deduped.filter((c) => !c.closed);
    const eligible = filterByRadius(request.lat, request.lng, request.radius, notClosed);
    const selected = pickUniform(eligible, this.rng);
    if (!selected) {
      throw new PickError("no_results", "No restaurants found within radius");
    }

    if (this.metadataEnricher) {
      try {
        const enriched = await this.metadataEnricher.enrich(selected, { ...request, perClickCap: 3 });
        selected.address = enriched.address || selected.address;
        selected.cuisine = enriched.cuisine && enriched.cuisine.length > 0 ? enriched.cuisine : selected.cuisine;
        selected.priceRange = enriched.priceRange || selected.priceRange;
      } catch {
        // Ignore metadata enrichment failures and preserve the selected candidate.
      }
    }

    if ((!selected.address || !selected.address.trim()) && Number.isFinite(selected.lat) && Number.isFinite(selected.lng)) {
      try {
        const resolvedAddress = await this.reverseGeocode(selected.lat as number, selected.lng as number);
        if (resolvedAddress) {
          selected.address = resolvedAddress;
        }
      } catch {
        // Keep original selection if reverse geocoding fails.
      }
    }

    return withFallbacks(selected);
  }
}

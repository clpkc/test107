import type { PickRequest, PickResponse } from "../models/restaurant";
import { withFallbacks } from "../models/restaurant";
import type { RestaurantProvider } from "../providers/RestaurantProvider";
import { dedupeCandidates } from "./dedupeService";
import { filterByRadius } from "./distanceService";
import { pickUniform, type RandomFn } from "./randomService";

export class PickError extends Error {
  constructor(public readonly code: "no_results" | "source_unavailable" | "parsing_failure" | "rate_limited", message: string) {
    super(message);
  }
}

export class PickService {
  constructor(private readonly provider: RestaurantProvider, private readonly rng: RandomFn = Math.random) {}

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

    return withFallbacks(selected);
  }
}

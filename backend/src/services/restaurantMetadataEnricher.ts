import type { ProviderContext } from "../providers/RestaurantProvider";
import type { RestaurantCandidate } from "../models/restaurant";

export interface RestaurantMetadataEnricher {
  enrich(candidate: RestaurantCandidate, ctx: ProviderContext): Promise<Partial<RestaurantCandidate>>;
}
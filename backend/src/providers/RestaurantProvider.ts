import type { RestaurantCandidate } from "../models/restaurant";

export interface ProviderContext {
  lat: number;
  lng: number;
  radius: number;
  perClickCap: number;
}

export interface RestaurantProvider {
  getCandidates(ctx: ProviderContext): Promise<RestaurantCandidate[]>;
}

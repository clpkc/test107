export type Cuisine = string;

export interface RestaurantCandidate {
  sourceUrl: string;
  canonicalId?: string;
  name?: string;
  address?: string;
  cuisine?: Cuisine[];
  priceRange?: string;
  photos?: string[];
  lat?: number;
  lng?: number;
  closed?: boolean;
  openriceUrl?: string;
}

export interface EligibleRestaurant extends RestaurantCandidate {
  canonicalId: string;
  distanceMeters: number;
}

export interface PickResponse {
  id: string;
  name: string;
  address: string;
  cuisine: string[];
  priceRange: string;
  photos: string[];
  sourceUrl: string;
  openriceUrl: string | null;
  distanceMeters: number;
}

export interface PickRequest {
  lat: number;
  lng: number;
  radius: number;
}

export type ErrorCode =
  | "invalid_input"
  | "no_results"
  | "rate_limited"
  | "source_unavailable"
  | "parsing_failure";

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
}

export function withFallbacks(item: EligibleRestaurant): PickResponse {
  return {
    id: item.canonicalId,
    name: item.name?.trim() || "Not available",
    address: item.address?.trim() || "Not available",
    cuisine: item.cuisine && item.cuisine.length > 0 ? item.cuisine : ["Not available"],
    priceRange: item.priceRange?.trim() || "Not available",
    photos: item.photos && item.photos.length > 0 ? item.photos : [],
    sourceUrl: item.sourceUrl,
    openriceUrl: item.openriceUrl || null,
    distanceMeters: item.distanceMeters,
  };
}

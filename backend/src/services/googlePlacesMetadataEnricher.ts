import type { RestaurantCandidate } from "../models/restaurant";
import type { ProviderContext } from "../providers/RestaurantProvider";
import type { RestaurantMetadataEnricher } from "./restaurantMetadataEnricher";

interface GoogleTextSearchResult {
  name?: string;
  formatted_address?: string;
  price_level?: number;
  types?: string[];
}

interface GoogleTextSearchResponse {
  results?: GoogleTextSearchResult[];
  status?: string;
}

function normalize(value?: string): string {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u3400-\u9fff]+/g, " ")
    .trim();
}

function toPriceRange(priceLevel?: number): string | undefined {
  if (!Number.isInteger(priceLevel) || priceLevel == null || priceLevel < 0) {
    return undefined;
  }
  return "$".repeat(Math.min(priceLevel + 1, 5));
}

const IGNORED_TYPES = new Set([
  "establishment",
  "food",
  "point_of_interest",
  "restaurant",
  "meal_takeaway",
  "meal_delivery",
]);

function toCuisine(types?: string[]): string[] | undefined {
  if (!types || types.length === 0) {
    return undefined;
  }

  const values = types
    .filter((type) => !IGNORED_TYPES.has(type))
    .map((type) => type.replace(/_/g, " "));

  return values.length > 0 ? values : undefined;
}

function scoreResult(candidate: RestaurantCandidate, result: GoogleTextSearchResult): number {
  const candidateName = normalize(candidate.name);
  const candidateAddress = normalize(candidate.address);
  const resultName = normalize(result.name);
  const resultAddress = normalize(result.formatted_address);

  let score = 0;
  if (candidateName && resultName) {
    if (candidateName === resultName) score += 10;
    else if (resultName.includes(candidateName) || candidateName.includes(resultName)) score += 6;
  }

  if (candidateAddress && resultAddress) {
    if (candidateAddress === resultAddress) score += 8;
    else if (resultAddress.includes(candidateAddress) || candidateAddress.includes(resultAddress)) score += 4;
  }

  return score;
}

export class GooglePlacesMetadataEnricher implements RestaurantMetadataEnricher {
  private readonly apiKey: string;
  private readonly fetcher: (url: string) => Promise<Response>;

  constructor(opts: { apiKey: string; fetcher?: (url: string) => Promise<Response> }) {
    this.apiKey = opts.apiKey;
    this.fetcher = opts.fetcher ?? ((url) => fetch(url));
  }

  async enrich(candidate: RestaurantCandidate, ctx: ProviderContext): Promise<Partial<RestaurantCandidate>> {
    if (!candidate.name) {
      return {};
    }

    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    const query = candidate.address ? `${candidate.name} ${candidate.address}` : candidate.name;
    url.searchParams.set("query", query);
    url.searchParams.set("location", `${ctx.lat},${ctx.lng}`);
    url.searchParams.set("radius", String(ctx.radius));
    url.searchParams.set("type", "restaurant");
    url.searchParams.set("key", this.apiKey);

    const response = await this.fetcher(url.toString());
    if (!response.ok) {
      return {};
    }

    const payload = (await response.json()) as GoogleTextSearchResponse;
    if (payload.status && payload.status !== "OK" && payload.status !== "ZERO_RESULTS") {
      return {};
    }

    const best = (payload.results ?? [])
      .map((result) => ({ result, score: scoreResult(candidate, result) }))
      .sort((left, right) => right.score - left.score)[0]?.result;

    if (!best) {
      return {};
    }

    return {
      address: best.formatted_address || undefined,
      cuisine: toCuisine(best.types),
      priceRange: toPriceRange(best.price_level),
    };
  }
}
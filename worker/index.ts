import { OverpassRestaurantProvider } from "../backend/src/providers/OverpassRestaurantProvider";
import { GooglePlacesMetadataEnricher } from "../backend/src/services/googlePlacesMetadataEnricher";
import { PickService, PickError } from "../backend/src/services/pickService";
import { reverseGeocodeAddress } from "../backend/src/services/reverseGeocodeService";
import type { ApiErrorBody } from "../backend/src/models/restaurant";

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  GOOGLE_MAPS_API_KEY?: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function handlePickRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lng = parseFloat(url.searchParams.get("lng") ?? "");
  const radiusRaw = parseInt(url.searchParams.get("radius") ?? "1000", 10);
  const radius = Number.isFinite(radiusRaw) ? radiusRaw : 1000;

  if (
    !Number.isFinite(lat) || lat < -90 || lat > 90 ||
    !Number.isFinite(lng) || lng < -180 || lng > 180 ||
    radius < 1 || radius > 1000
  ) {
    const body: ApiErrorBody = { code: "invalid_input", message: "Invalid location or radius" };
    return jsonResponse(body, 400);
  }

  const provider = new OverpassRestaurantProvider();
  const metadataEnricher = env.GOOGLE_MAPS_API_KEY
    ? new GooglePlacesMetadataEnricher({ apiKey: env.GOOGLE_MAPS_API_KEY })
    : undefined;

  const pickService = new PickService(
    provider,
    Math.random,
    reverseGeocodeAddress,
    metadataEnricher,
  );

  try {
    const result = await pickService.pick({ lat, lng, radius });
    return jsonResponse(result, 200);
  } catch (error) {
    if (error instanceof PickError) {
      const statusMap: Record<string, number> = {
        no_results: 404,
        source_unavailable: 502,
        parsing_failure: 503,
        rate_limited: 429,
      };
      const status = statusMap[error.code] ?? 503;
      const body: ApiErrorBody = { code: error.code as ApiErrorBody["code"], message: error.message };
      return jsonResponse(body, status);
    }
    const body: ApiErrorBody = { code: "parsing_failure", message: "Unexpected failure" };
    return jsonResponse(body, 503);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/pick") {
      return handlePickRequest(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

import type { RestaurantCandidate } from "../models/restaurant";

export function canonicalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    url.hash = "";
    url.search = "";
    if (url.pathname.endsWith("/") && url.pathname.length > 1) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return raw.trim();
  }
}

export function fallbackIdentity(name?: string, address?: string): string {
  return `${(name || "").trim().toLowerCase()}|${(address || "").trim().toLowerCase()}`;
}

export function dedupeCandidates(candidates: RestaurantCandidate[]): RestaurantCandidate[] {
  const seen = new Set<string>();
  const deduped: RestaurantCandidate[] = [];

  for (const candidate of candidates) {
    const key = candidate.sourceUrl
      ? canonicalizeUrl(candidate.sourceUrl)
      : fallbackIdentity(candidate.name, candidate.address);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ ...candidate, canonicalId: key });
  }

  return deduped;
}

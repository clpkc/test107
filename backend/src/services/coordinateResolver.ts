export type GeocodeFn = (address: string) => Promise<{ lat: number; lng: number } | null>;

function parseMapQuery(url: string): { lat: number; lng: number } | null {
  try {
    const parsed = new URL(url);
    const q = parsed.searchParams.get("q") || "";
    const match = q.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (!match) return null;
    return { lat: Number(match[1]), lng: Number(match[2]) };
  } catch {
    return null;
  }
}

export function extractCoordinatesFromHtml(html: string): { lat: number; lng: number } | null {
  const latMatch = html.match(/"latitude"\s*:\s*"?(-?\d+\.\d+)"?/i) || html.match(/data-lat\s*=\s*"(-?\d+\.\d+)"/i);
  const lngMatch = html.match(/"longitude"\s*:\s*"?(-?\d+\.\d+)"?/i) || html.match(/data-lng\s*=\s*"(-?\d+\.\d+)"/i);
  if (latMatch && lngMatch) {
    return { lat: Number(latMatch[1]), lng: Number(lngMatch[1]) };
  }

  const linkMatch = html.match(/https?:\/\/[^"'\s]+google\.com\/maps[^"'\s]*/i);
  if (linkMatch) {
    return parseMapQuery(linkMatch[0]);
  }
  return null;
}

export async function resolveCoordinates(
  html: string,
  address: string | undefined,
  geocode: GeocodeFn,
): Promise<{ lat: number; lng: number } | null> {
  const extracted = extractCoordinatesFromHtml(html);
  if (extracted) return extracted;
  if (!address) return null;
  return geocode(address);
}

export interface PickResult {
  id: string;
  name: string;
  address: string;
  cuisine: string[];
  priceRange: string;
  photos: string[];
  sourceUrl: string;
  distanceMeters: number;
}

export interface PickError {
  code: string;
  message: string;
}

export async function pickRestaurant(lat: number, lng: number, radius = 1000): Promise<PickResult> {
  const url = `/api/pick?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const payload = (await res.json().catch(() => ({ code: "unknown", message: "Unknown error" }))) as PickError;
    throw new Error(`${payload.code}:${payload.message}`);
  }
  return (await res.json()) as PickResult;
}

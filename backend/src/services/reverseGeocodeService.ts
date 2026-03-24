export type ReverseGeocodeFn = (lat: number, lng: number) => Promise<string | null>;

export async function reverseGeocodeAddress(lat: number, lng: number): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "lunch-picker/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    address?: {
      house_number?: string;
      road?: string;
      suburb?: string;
      city_district?: string;
      city?: string;
    };
    display_name?: string;
  };

  const addr = payload.address;
  if (!addr) {
    return payload.display_name?.trim() || null;
  }

  const line1 = [addr.house_number, addr.road].filter(Boolean).join(" ").trim();
  const line2 = [addr.suburb, addr.city_district, addr.city].filter(Boolean).join(", ").trim();
  const composed = [line1, line2].filter(Boolean).join(", ").trim();

  return composed || payload.display_name?.trim() || null;
}
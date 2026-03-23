import type { RestaurantCandidate, EligibleRestaurant } from "../models/restaurant";

const EARTH_RADIUS_M = 6371000;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_M * c);
}

export function filterByRadius(
  lat: number,
  lng: number,
  radius: number,
  candidates: RestaurantCandidate[],
): EligibleRestaurant[] {
  return candidates
    .filter((c): c is RestaurantCandidate & { lat: number; lng: number } =>
      typeof c.lat === "number" && typeof c.lng === "number",
    )
    .map((c) => {
      const distanceMeters = calculateDistanceMeters(lat, lng, c.lat, c.lng);
      return {
        ...c,
        canonicalId: c.canonicalId || c.sourceUrl,
        distanceMeters,
      } as EligibleRestaurant;
    })
    .filter((c) => c.distanceMeters <= radius);
}

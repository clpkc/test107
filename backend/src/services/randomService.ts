import type { EligibleRestaurant } from "../models/restaurant";

export type RandomFn = () => number;

export function pickUniform(
  items: EligibleRestaurant[],
  rng: RandomFn = Math.random,
): EligibleRestaurant | null {
  if (items.length === 0) return null;
  const index = Math.floor(rng() * items.length);
  return items[index] || null;
}

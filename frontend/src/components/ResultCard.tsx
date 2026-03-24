import React from "react";
import type { PickResult } from "../services/pickApiClient";

interface Props {
  result: PickResult | null;
}

function fallback(value: string | undefined): string {
  return value && value.trim() ? value : "Not available";
}

function buildOpenRiceUrl(result: PickResult): string {
  if (result.sourceUrl.includes("openrice.com")) {
    return result.sourceUrl;
  }

  const searchText = [result.name, result.address]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  if (!searchText) {
    return "https://www.openrice.com/en/hongkong/restaurants";
  }

  return `https://www.openrice.com/en/hongkong/restaurants?whatwhere=${encodeURIComponent(searchText)}`;
}

export function ResultCard({ result }: Props): JSX.Element {
  if (!result) return <section aria-label="result-card">No selection yet.</section>;
  const openRiceUrl = buildOpenRiceUrl(result);

  return (
    <section aria-label="result-card">
      <h2>{fallback(result.name)}</h2>
      <p><strong>Address:</strong> {fallback(result.address)}</p>
      <p><strong>Cuisine:</strong> {result.cuisine.length > 0 ? result.cuisine.join(", ") : "Not available"}</p>
      <p><strong>Price Range:</strong> {fallback(result.priceRange)}</p>
      <p><strong>Distance:</strong> {result.distanceMeters}m</p>
      <p>
        <strong>OpenRice:</strong>{" "}
        <a href={openRiceUrl} target="_blank" rel="noreferrer">View on OpenRice</a>
      </p>
    </section>
  );
}

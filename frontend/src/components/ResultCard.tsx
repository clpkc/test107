import React from "react";
import type { PickResult } from "../services/pickApiClient";

interface Props {
  result: PickResult | null;
}

function fallback(value: string | undefined): string {
  return value && value.trim() ? value : "Not available";
}

function buildOpenRiceUrl(result: PickResult): string {
  // Use actual OpenRice restaurant page URL if available from OSM data
  if (result.openriceUrl && result.openriceUrl.includes("openrice.com")) {
    return result.openriceUrl;
  }

  if (result.sourceUrl.includes("openrice.com")) {
    return result.sourceUrl;
  }

  const name = result.name && result.name !== "Not available" ? result.name.trim() : "";
  const address = result.address && result.address !== "Not available"
    ? result.address
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)[0] || ""
    : "";

  if (!name && !address) {
    return "https://www.openrice.com/en/hongkong/restaurants";
  }

  const url = new URL("https://www.openrice.com/en/hongkong/restaurants");

  if (name && address) {
    // Prefer separated query fields to avoid no-result cases when concatenated.
    url.searchParams.set("what", name);
    url.searchParams.set("where", address);
    return url.toString();
  }

  url.searchParams.set("whatwhere", name || address);
  return url.toString();
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

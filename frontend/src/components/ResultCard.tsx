import React from "react";
import type { PickResult } from "../services/pickApiClient";

interface Props {
  result: PickResult | null;
}

function fallback(value: string | undefined): string {
  return value && value.trim() ? value : "Not available";
}

export function ResultCard({ result }: Props): JSX.Element {
  if (!result) return <section aria-label="result-card">No selection yet.</section>;

  const photos = result.photos && result.photos.length > 0 ? result.photos : [];

  return (
    <section aria-label="result-card">
      <h2>{fallback(result.name)}</h2>
      <p><strong>Address:</strong> {fallback(result.address)}</p>
      <p><strong>Cuisine:</strong> {result.cuisine.length > 0 ? result.cuisine.join(", ") : "Not available"}</p>
      <p><strong>Price Range:</strong> {fallback(result.priceRange)}</p>
      <p><strong>Distance:</strong> {result.distanceMeters}m</p>
      <p>
        <strong>Photos:</strong>{" "}
        {photos.length > 0 ? photos.map((photo) => <a key={photo} href={photo}>Photo</a>) : "Not available"}
      </p>
    </section>
  );
}

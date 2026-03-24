import React, { useState } from "react";
import { PickButton } from "../components/PickButton";
import { ResultCard } from "../components/ResultCard";
import { pickRestaurant, type PickResult } from "../services/pickApiClient";

const DEFAULT_LAT = "22.3091527";
const DEFAULT_LNG = "114.1919380";

export function HomePage(): JSX.Element {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [result, setResult] = useState<PickResult | null>(null);
  const [error, setError] = useState<string>("");
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onPick(): Promise<void> {
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (!lat || !lng || isNaN(numLat) || isNaN(numLng)) {
      setResult(null);
      setError("Please enter latitude and longitude first.");
      return;
    }
    setResult(null);
    setError("");
    setRetryable(false);
    setLoading(true);
    try {
      const picked = await pickRestaurant(numLat, numLng, 1000);
      setResult(picked);
    } catch (err) {
      setResult(null);
      const message = String((err as Error).message || "");
      if (message.startsWith("no_results:")) {
        setError("No restaurants found within 1000m of those coordinates.");
        setRetryable(true);
      } else if (message.startsWith("source_unavailable:") || message.startsWith("rate_limited:")) {
        setError("Source unavailable. Please retry.");
        setRetryable(true);
      } else if (message.startsWith("parsing_failure:")) {
        setError("Unable to parse source data. Please retry.");
        setRetryable(true);
      } else if (message.startsWith("invalid_input:")) {
        setError("Invalid coordinates. Latitude must be −90 to 90, longitude −180 to 180.");
      } else {
        setError(`Unexpected error: ${message}`);
        setRetryable(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Lunch Picker</h1>

      <p style={{ color: "#555", marginBottom: "0.5rem" }}>
        Using default location for 8 Laguna Verde Ave, Hung Hom, Hong Kong.
        You can edit the coordinates below, then press <strong>Pick a Restaurant</strong>.
      </p>

      <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <label>
          Latitude
          <input
            style={{ marginLeft: "0.25rem", width: 130 }}
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 22.3025"
            aria-label="latitude"
          />
        </label>
        <label>
          Longitude
          <input
            style={{ marginLeft: "0.25rem", width: 130 }}
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. 114.1737"
            aria-label="longitude"
          />
        </label>
      </div>

      <PickButton onClick={() => void onPick()} disabled={loading} />

      {loading ? <p style={{ color: "#555" }}>Picking a restaurant…</p> : null}
      {error ? <p role="alert" style={{ color: "crimson" }}>{error}</p> : null}
      {retryable ? (
        <button type="button" onClick={() => void onPick()} disabled={loading}>
          Retry
        </button>
      ) : null}

      <ResultCard result={result} />
    </main>
  );
}

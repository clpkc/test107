import React, { useState } from "react";
import { PickButton } from "../components/PickButton";
import { ResultCard } from "../components/ResultCard";
import { pickRestaurant, type PickResult } from "../services/pickApiClient";

export function HomePage(): JSX.Element {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [result, setResult] = useState<PickResult | null>(null);
  const [error, setError] = useState<string>("");
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  function handleAutoDetect(): void {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }
    setDetecting(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        setDetecting(false);
      },
      (err) => {
        setError(`Could not auto-detect location (${err.message}). Enter coordinates manually.`);
        setDetecting(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  async function onPick(): Promise<void> {
    const numLat = Number(lat);
    const numLng = Number(lng);
    if (!lat || !lng || isNaN(numLat) || isNaN(numLng)) {
      setError("Please enter valid latitude and longitude.");
      return;
    }
    setError("");
    setRetryable(false);
    setLoading(true);
    try {
      const picked = await pickRestaurant(numLat, numLng, 1000);
      setResult(picked);
    } catch (err) {
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
        setError("Invalid coordinates. Latitude must be -90–90, longitude -180–180.");
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

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>
          Latitude
          <input
            style={{ marginLeft: "0.25rem", marginRight: "1rem", width: 130 }}
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g. 22.3025"
            aria-label="latitude"
          />
        </label>
        <label style={{ marginRight: "0.5rem" }}>
          Longitude
          <input
            style={{ marginLeft: "0.25rem", marginRight: "1rem", width: 130 }}
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="e.g. 114.1737"
            aria-label="longitude"
          />
        </label>
        <button type="button" onClick={handleAutoDetect} disabled={detecting} style={{ marginRight: "0.5rem" }}>
          {detecting ? "Detecting…" : "Auto-detect"}
        </button>
      </div>

      <PickButton onClick={() => void onPick()} disabled={loading || detecting} />

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

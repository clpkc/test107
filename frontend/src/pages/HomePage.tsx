import React, { useState } from "react";
import { PickButton } from "../components/PickButton";
import { ManualLocationForm } from "../components/ManualLocationForm";
import { ResultCard } from "../components/ResultCard";
import { pickRestaurant, type PickResult } from "../services/pickApiClient";

export function HomePage(): JSX.Element {
  const [manualMode, setManualMode] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [result, setResult] = useState<PickResult | null>(null);
  const [error, setError] = useState<string>("");
  const [retryable, setRetryable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<string>("");

  async function resolveLocation(): Promise<{ lat: number; lng: number }> {
    if (manualLocation) return manualLocation;
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => reject(new Error("location_denied")),
        { enableHighAccuracy: false },
      );
    });
  }

  async function onPick(): Promise<void> {
    setError("");
    setRetryable(false);
    setLoading(true);
    setDebug("Loading...");
    try {
      const location = await resolveLocation();
      setDebug(`Got location: ${location.lat}, ${location.lng}`);
      const picked = await pickRestaurant(location.lat, location.lng, 1000);
      setResult(picked);
      setDebug("");
    } catch (err) {
      const message = String((err as Error).message || "");
      setDebug(`Error: ${message}`);
      console.error("Pick error:", err);
      if (message.includes("location_denied")) {
        setManualMode(true);
        setError("Location denied. Enter a manual location.");
      } else if (message.startsWith("no_results:")) {
        setError("No restaurants found within 1000m. Please retry.");
        setRetryable(true);
      } else if (message.startsWith("source_unavailable:") || message.startsWith("rate_limited:")) {
        setError("Source unavailable. Please retry.");
        setRetryable(true);
      } else if (message.startsWith("parsing_failure:")) {
        setError("Unable to parse source data. Please retry.");
        setRetryable(true);
      } else {
        setError("Unexpected error. Please retry.");
        setRetryable(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Lunch Picker</h1>
      {manualMode ? (
        <ManualLocationForm
          onSubmit={(lat, lng) => {
            setManualLocation({ lat, lng });
            setError("");
          }}
        />
      ) : null}
      <PickButton onClick={() => void onPick()} disabled={loading} />
      {debug ? <p style={{ color: "#666", fontSize: "0.9em" }}>{debug}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {retryable ? (
        <button type="button" onClick={() => void onPick()} disabled={loading}>
          Retry
        </button>
      ) : null}
      <ResultCard result={result} />
    </main>
  );
}

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

  async function resolveLocation(): Promise<{ lat: number; lng: number }> {
    if (manualLocation) return manualLocation;

    if (!navigator.geolocation) {
      throw new Error("location_unavailable");
    }

    return await Promise.race([
      new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          () => reject(new Error("location_denied")),
          { enableHighAccuracy: false },
        );
      }),
      new Promise<{ lat: number; lng: number }>((_resolve, reject) => {
        setTimeout(() => reject(new Error("location_timeout")), 6000);
      }),
    ]);
  }

  async function onPick(): Promise<void> {
    setError("");
    setRetryable(false);
    setLoading(true);
    try {
      const location = await resolveLocation();
      const picked = await pickRestaurant(location.lat, location.lng, 1000);
      setResult(picked);
    } catch (err) {
      const message = String((err as Error).message || "");
      if (message.includes("location_denied")) {
        setManualMode(true);
        setError("Location denied. Enter a manual location.");
      } else if (message.includes("location_timeout") || message.includes("location_unavailable")) {
        setManualMode(true);
        setError("Location unavailable in this browser. Enter a manual location.");
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
      {loading ? <p>Loading...</p> : null}
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

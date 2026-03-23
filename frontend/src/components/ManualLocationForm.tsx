import React, { useState } from "react";

interface Props {
  onSubmit: (lat: number, lng: number) => void;
}

export function ManualLocationForm({ onSubmit }: Props): JSX.Element {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(Number(lat), Number(lng));
      }}
    >
      <label>
        Latitude
        <input value={lat} onChange={(e) => setLat(e.target.value)} aria-label="latitude" />
      </label>
      <label>
        Longitude
        <input value={lng} onChange={(e) => setLng(e.target.value)} aria-label="longitude" />
      </label>
      <button type="submit">Use Manual Location</button>
    </form>
  );
}

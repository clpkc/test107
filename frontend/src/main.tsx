import React from "react";
import { createRoot } from "react-dom/client";
import { HomePage } from "./pages/HomePage";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <HomePage />
    </React.StrictMode>,
  );
}

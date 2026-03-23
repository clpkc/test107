import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../../src/pages/HomePage";

describe("error states", () => {
  it("renders source unavailable error and retry-safe message", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (ok: any) => ok({ coords: { latitude: 22.3, longitude: 114.1 } }),
      },
    });
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ code: "source_unavailable", message: "down" }), { status: 502 })));

    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Pick a Restaurant" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Source unavailable");
    });
  });
});

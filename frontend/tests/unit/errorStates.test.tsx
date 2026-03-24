import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../../src/pages/HomePage";

describe("error states", () => {
  it("renders source unavailable error and retry-safe message", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ code: "source_unavailable", message: "down" }), { status: 502 })));

    render(<HomePage />);
    // Fill in coordinates before clicking Pick
    fireEvent.change(screen.getByLabelText("latitude"), { target: { value: "22.3" } });
    fireEvent.change(screen.getByLabelText("longitude"), { target: { value: "114.1" } });
    fireEvent.click(screen.getByRole("button", { name: "Pick a Restaurant" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Source unavailable");
    });
  });
});

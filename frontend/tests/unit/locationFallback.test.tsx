import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../../src/pages/HomePage";

describe("location fallback", () => {
  it("shows error message when auto-detect fails", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (_ok: unknown, fail: (e: { message: string }) => void) =>
          fail({ message: "User denied Geolocation" }),
      },
    });

    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Auto-detect" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toMatch(/auto-detect/i),
    );
  });
});

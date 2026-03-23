import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../../src/pages/HomePage";

vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
  id: "1",
  name: "A",
  address: "B",
  cuisine: ["Cafe"],
  priceRange: "$101-200",
  photos: [],
  sourceUrl: "https://www.openrice.com",
  distanceMeters: 10,
}), { status: 200 })));

describe("location fallback", () => {
  it("shows manual location form when permission denied", async () => {
    vi.stubGlobal("navigator", {
      geolocation: {
        getCurrentPosition: (_ok: any, fail: any) => fail(),
      },
    });

    render(<HomePage />);
    fireEvent.click(screen.getByRole("button", { name: "Pick a Restaurant" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Use Manual Location" })).toBeInTheDocument());
  });
});

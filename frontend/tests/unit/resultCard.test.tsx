import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultCard } from "../../src/components/ResultCard";

describe("result card fallbacks", () => {
  it("shows Not available for missing fields", () => {
    render(
      <ResultCard
        result={{
          id: "1",
          name: "",
          address: "",
          cuisine: [],
          priceRange: "",
          photos: [],
          sourceUrl: "https://www.openrice.com",
          distanceMeters: 10,
        }}
      />,
    );

    expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
  });

  it("uses actual openriceUrl when available", () => {
    const actualUrl = "https://www.openrice.com/en/hongkong/r-v-king-station-hung-hom-thai-wine-r651794";
    render(
      <ResultCard
        result={{
          id: "1",
          name: "V King Lounge",
          address: "123 Main St",
          cuisine: ["Thai"],
          priceRange: "$$",
          photos: [],
          sourceUrl: "https://www.openstreetmap.org/node/123",
          openriceUrl: actualUrl,
          distanceMeters: 500,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /View on OpenRice/i });
    expect(link).toHaveAttribute("href", actualUrl);
  });

  it("falls back to search URL when openriceUrl is not available", () => {
    render(
      <ResultCard
        result={{
          id: "1",
          name: "Test Restaurant",
          address: "123 Main St",
          cuisine: ["Thai"],
          priceRange: "$$",
          photos: [],
          sourceUrl: "https://www.openstreetmap.org/node/123",
          distanceMeters: 500,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /View on OpenRice/i });
    const href = link.getAttribute("href");
    expect(href).toContain("openrice.com");
    expect(href).toContain("restaurants?");
    expect(href).toContain("what=");
    expect(href).toContain("where=");
  });

  it("uses whatwhere when only one searchable field exists", () => {
    render(
      <ResultCard
        result={{
          id: "1",
          name: "Only Name",
          address: "Not available",
          cuisine: ["Thai"],
          priceRange: "$$",
          photos: [],
          sourceUrl: "https://www.openstreetmap.org/node/123",
          distanceMeters: 500,
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /View on OpenRice/i });
    const href = link.getAttribute("href");
    expect(href).toContain("restaurants?whatwhere=");
  });
});

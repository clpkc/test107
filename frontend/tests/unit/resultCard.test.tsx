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
});

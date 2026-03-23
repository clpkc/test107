import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PickButton } from "../../src/components/PickButton";

describe("PickButton label", () => {
  it("matches exact button text", () => {
    render(<PickButton onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Pick a Restaurant" })).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentWordPanel } from "./CurrentWordPanel";

describe("CurrentWordPanel", () => {
  it("renders with the correct container id", () => {
    render(<CurrentWordPanel />);
    expect(document.getElementById("current-word-panel")).toBeInTheDocument();
  });

  it("has the correct aria-label", () => {
    render(<CurrentWordPanel />);
    expect(screen.getByLabelText("Current Word Panel")).toBeInTheDocument();
  });

  it("displays the panel title", () => {
    render(<CurrentWordPanel />);
    expect(screen.getByText("Current Word")).toBeInTheDocument();
  });

  it("displays placeholder text", () => {
    render(<CurrentWordPanel />);
    expect(screen.getByText("Select a word to see details.")).toBeInTheDocument();
  });
});

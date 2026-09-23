import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GrammarPanel } from "./GrammarPanel";

describe("GrammarPanel", () => {
  it("renders with the correct container id", () => {
    render(<GrammarPanel />);
    expect(document.getElementById("grammar-panel")).toBeInTheDocument();
  });

  it("has the correct aria-label", () => {
    render(<GrammarPanel />);
    expect(screen.getByLabelText("Grammar Panel")).toBeInTheDocument();
  });

  it("displays the panel title", () => {
    render(<GrammarPanel />);
    expect(screen.getByText("Grammar Panel")).toBeInTheDocument();
  });

  it("displays placeholder text", () => {
    render(<GrammarPanel />);
    expect(screen.getByText("Grammar feedback will appear here.")).toBeInTheDocument();
  });
});

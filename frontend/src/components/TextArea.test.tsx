import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextArea } from "./TextArea";

describe("TextArea", () => {
  it("renders with the correct container id", () => {
    render(<TextArea />);
    expect(document.getElementById("text-area")).toBeInTheDocument();
  });

  it("has the correct aria-label", () => {
    render(<TextArea />);
    expect(screen.getByLabelText("Text Area")).toBeInTheDocument();
  });

  it("renders a textarea element", () => {
    render(<TextArea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays the panel title", () => {
    render(<TextArea />);
    expect(screen.getByText("Text Area")).toBeInTheDocument();
  });
});

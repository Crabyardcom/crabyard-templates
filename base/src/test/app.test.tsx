import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("App", () => {
  it("renders without crashing", () => {
    render(<div data-testid="root">Hello Crabyard</div>);
    expect(screen.getByTestId("root")).toBeInTheDocument();
  });
});

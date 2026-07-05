import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChainMark from "@/components/brand/ChainMark";
import Logo from "@/components/brand/Logo";

describe("ChainMark", () => {
  it("renders an accessible chain graphic with the requested block count", () => {
    const { container } = render(<ChainMark count={5} animated={false} />);
    expect(
      screen.getByRole("img", { name: /chain of verified ballot blocks/i }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("rect")).toHaveLength(5);
  });
});

describe("Logo", () => {
  it("renders the wordmark", () => {
    render(<Logo />);
    expect(screen.getByText(/Quantum/)).toBeInTheDocument();
    expect(screen.getByText(/Ballot/)).toBeInTheDocument();
  });
});

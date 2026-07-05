import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Home from "@/pages/Home";

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

describe("Home page", () => {
  it("renders the hero headline", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { name: /Elections you can count on/i }),
    ).toBeInTheDocument();
  });

  it("links to sign up and sign in", () => {
    renderHome();
    const signUp = screen.getAllByRole("link", { name: /Create account/i })[0];
    const signIn = screen.getAllByRole("link", { name: /Sign in/i })[0];
    expect(signUp).toHaveAttribute("href", "/signup");
    expect(signIn).toHaveAttribute("href", "/signin");
  });

  it("presents the four-step process in order", () => {
    renderHome();
    ["Register", "Verify", "Vote", "Publish"].forEach((step) => {
      expect(screen.getByRole("heading", { name: step })).toBeInTheDocument();
    });
  });
});

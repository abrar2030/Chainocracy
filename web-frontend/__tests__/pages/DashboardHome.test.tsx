import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ authState: { name: "Ada", username: "ada" } }),
}));

import DashboardHome from "@/pages/DashboardHome";

describe("DashboardHome page", () => {
  it("greets the signed-in user", () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: /Welcome back, Ada/i }),
    ).toBeInTheDocument();
  });

  it("renders shortcut links to core areas", () => {
    render(
      <MemoryRouter>
        <DashboardHome />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Jump back in/i)).toBeInTheDocument();
    const candidates = screen.getByRole("link", { name: /Candidates/i });
    expect(candidates).toHaveAttribute("href", "/candidates");
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

let authValue: any = {};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => authValue,
}));

import ProtectedLayout from "@/components/routing/ProtectedLayout";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<ProtectedLayout />}>
          <Route
            path="/dashboard"
            element={<div data-testid="protected">Protected content</div>}
          />
        </Route>
        <Route path="/signin" element={<div>Sign in page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedLayout", () => {
  it("redirects unauthenticated visitors to sign in", () => {
    authValue = { authState: { authenticated: false }, isLoggedIn: vi.fn() };
    renderAt("/dashboard");
    expect(screen.getByText(/Sign in page/i)).toBeInTheDocument();
  });

  it("renders the app shell for authenticated users", () => {
    authValue = {
      authState: {
        authenticated: true,
        name: "Ada",
        username: "ada",
        role: "admin",
      },
      isLoggedIn: vi.fn(),
      onLogOut: vi.fn(),
    };
    renderAt("/dashboard");
    expect(screen.getByText(/Election control center/i)).toBeInTheDocument();
    expect(screen.getByText(/Protected content/i)).toBeInTheDocument();
  });
});

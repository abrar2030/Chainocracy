import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const onLogin = vi.fn();
const navigate = vi.fn();

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ onLogin }),
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigate };
});

import SignIn from "@/pages/SignIn";

const renderSignIn = () =>
  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>,
  );

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("SignIn page", () => {
  beforeEach(() => {
    onLogin.mockReset();
    navigate.mockReset();
  });

  it("renders the sign-in form", () => {
    renderSignIn();
    expect(
      screen.getByRole("heading", { name: /Committee sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("shows a validation message when fields are empty", () => {
    renderSignIn();
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));
    expect(
      screen.getByText(/Enter your username and password/i),
    ).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("calls onLogin and navigates to the dashboard on success", async () => {
    onLogin.mockResolvedValue({ data: { accessToken: "token-123" } });
    renderSignIn();
    fill(/Username/i, "committee");
    fill(/Password/i, "secret");
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));

    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith("committee", "secret"),
    );
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error message when credentials are rejected", async () => {
    onLogin.mockResolvedValue({ error: true });
    renderSignIn();
    fill(/Username/i, "committee");
    fill(/Password/i, "wrong");
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));
    await waitFor(() =>
      expect(screen.getByText(/did not match/i)).toBeInTheDocument(),
    );
  });
});

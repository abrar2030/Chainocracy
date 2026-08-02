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
      screen.getByRole("heading", { name: /Sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Electoral ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("shows a validation message when fields are empty", () => {
    renderSignIn();
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));
    expect(
      screen.getByText(/Enter your Electoral ID and password/i),
    ).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("calls onLogin and navigates to the dashboard on success", async () => {
    onLogin.mockResolvedValue({ data: { accessToken: "token-123" } });
    renderSignIn();
    fill(/Electoral ID/i, "YJK883542");
    fill(/Password/i, "secret");
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));

    await waitFor(() =>
      expect(onLogin).toHaveBeenCalledWith("YJK883542", "secret"),
    );
    await waitFor(() => expect(navigate).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error message when credentials are rejected", async () => {
    onLogin.mockResolvedValue({ error: true, status: 401 });
    renderSignIn();
    fill(/Electoral ID/i, "YJK883542");
    fill(/Password/i, "wrong");
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));
    await waitFor(() =>
      expect(screen.getByText(/did not match/i)).toBeInTheDocument(),
    );
  });

  it("shows a server error message on a 500, not a credentials message", async () => {
    onLogin.mockResolvedValue({ error: true, status: 500 });
    renderSignIn();
    fill(/Electoral ID/i, "YJK883542");
    fill(/Password/i, "secret123");
    fireEvent.click(screen.getByRole("button", { name: /^Sign in$/i }));
    await waitFor(() =>
      expect(screen.getByText(/went wrong on our end/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/did not match/i)).not.toBeInTheDocument();
  });
});

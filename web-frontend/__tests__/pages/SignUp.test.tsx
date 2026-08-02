import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

const navigate = vi.fn();

vi.mock("axios");
vi.mock("@/context/AuthContext", () => ({
  API_URL: "http://localhost:3010",
}));
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigate };
});

import SignUp from "@/pages/SignUp";

const renderSignUp = () =>
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>,
  );

const fill = (label: RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("SignUp page", () => {
  beforeEach(() => {
    navigate.mockReset();
    (axios.post as unknown as ReturnType<typeof vi.fn>)?.mockReset?.();
  });

  it("renders the registration form with state options, and no Electoral ID field", () => {
    renderSignUp();
    expect(
      screen.getByRole("heading", { name: /Create your account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Select your state/i)).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "California" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/Electoral ID/i)).not.toBeInTheDocument();
  });

  it("blocks submission until every field is filled", () => {
    renderSignUp();
    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));
    expect(screen.getByText(/Fill in every field/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("registers with an auto-generated electoral ID and routes to sign in on success", async () => {
    (axios.post as any).mockResolvedValue({ status: 201 });
    renderSignUp();

    fill(/Full name/i, "Ada Voter");
    fill(/Email/i, "ada@example.com");
    fill(/Address/i, "12 Chain St");
    fireEvent.change(screen.getByLabelText(/State/i), {
      target: { value: "California" },
    });
    fill(/Password/i, "secret123");

    fireEvent.click(screen.getByRole("button", { name: /Create account/i }));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:3010/api/committee/register-voter",
        expect.objectContaining({
          electoralId: expect.stringMatching(/^[A-Z]{3}\d{6}$/),
          name: "Ada Voter",
          province: "California",
        }),
      ),
    );
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        "/signin",
        expect.objectContaining({
          state: expect.objectContaining({ registered: true }),
        }),
      ),
    );
  });
});

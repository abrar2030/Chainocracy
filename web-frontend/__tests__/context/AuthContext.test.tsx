import { render, screen, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Mock dependencies
vi.mock("axios");
vi.mock("@/services/firebase", () => ({
  loadImages: vi.fn(),
}));
vi.mock("@/context/SecureStore", () => ({
  getItemAsync: vi.fn().mockResolvedValue(null),
  setItemAsync: vi.fn().mockResolvedValue(undefined),
  deleteItemAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/global/globalVariables", () => ({
  TOKEN_KEY: "test-jwt",
  REFRESH_TOKEN_KEY: "test-refresh",
  TOKEN_USERNAME: "test-username",
  TOKEN_NAME: "test-name",
  TOKEN_ROLE: "test-role",
  GLOBAL_VARIABLES: { LOCALHOST: "localhost:3010" },
}));

const TestConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">
        {String(auth.authState?.authenticated)}
      </span>
      <span data-testid="has-login">
        {typeof auth.onLogin === "function" ? "yes" : "no"}
      </span>
      <span data-testid="has-logout">
        {typeof auth.onLogOut === "function" ? "yes" : "no"}
      </span>
      <span data-testid="has-provinces">
        {auth.provinces?.length > 0 ? "yes" : "no"}
      </span>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides initial auth state as null", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("authenticated").textContent).toBe("null");
    });
  });

  it("provides onLogin function", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("has-login").textContent).toBe("yes");
    });
  });

  it("provides onLogOut function", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("has-logout").textContent).toBe("yes");
    });
  });

  it("provides provinces list", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("has-provinces").textContent).toBe("yes");
    });
  });

  it("provides 50 states (US)", async () => {
    const ProvincesCount = () => {
      const { provinces } = useAuth();
      return <span data-testid="count">{provinces?.length}</span>;
    };
    render(
      <AuthProvider>
        <ProvincesCount />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("50");
    });
  });

  it("logout clears auth state", async () => {
    const LogoutTest = () => {
      const { authState, onLogOut } = useAuth();
      return (
        <div>
          <span data-testid="token">{authState.token ?? "null"}</span>
          <button onClick={() => onLogOut?.()}>Logout</button>
        </div>
      );
    };
    render(
      <AuthProvider>
        <LogoutTest />
      </AuthProvider>,
    );
    await act(async () => {
      screen.getByText("Logout").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("token").textContent).toBe("null");
    });
  });

  it("renders children correctly", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child component</div>
      </AuthProvider>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});

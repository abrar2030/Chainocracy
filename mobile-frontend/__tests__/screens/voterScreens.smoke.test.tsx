/**
 * Smoke tests: every voter-facing screen mounts without crashing.
 * Network (axios) and navigation are mocked globally in jest.setup.js.
 * AuthContext is mocked here with a signed-in voter.
 */
import { render } from "@testing-library/react-native";
import React from "react";

jest.mock("src/context/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    authState: {
      token: "test-token",
      authenticated: true,
      email: "voter@example.com",
      electoralId: "EL-1",
      port: "3010",
    },
    onLogin: jest.fn().mockResolvedValue({ success: true }),
    onRegister: jest.fn().mockResolvedValue({ success: true }),
    onLogOut: jest.fn().mockResolvedValue({ success: true }),
    isLoggedIn: jest.fn().mockResolvedValue({ authenticated: true }),
    isLoading: false,
    imageList: {},
    setImageList: jest.fn(),
  }),
}));

import { CandidateDetails } from "src/screens/CandidateDetails";
import { Candidates } from "src/screens/Candidates";
import { Groups } from "src/screens/Groups";
import { Login } from "src/screens/Login";
import { Registration } from "src/screens/Registration";

describe("voter screens mount without crashing", () => {
  it("Login", () => {
    expect(() => render(<Login />)).not.toThrow();
  });
  it("Registration", () => {
    expect(() => render(<Registration />)).not.toThrow();
  });
  it("Groups", () => {
    expect(() => render(<Groups />)).not.toThrow();
  });
  it("Candidates", () => {
    expect(() => render(<Candidates />)).not.toThrow();
  });
  it("CandidateDetails", () => {
    const route = {
      params: { name: "Ada", party: "Chain Party", acronym: "CP" },
    };
    const navigation = { goBack: jest.fn(), navigate: jest.fn() };
    expect(() =>
      render(<CandidateDetails route={route} navigation={navigation} />),
    ).not.toThrow();
  });
});

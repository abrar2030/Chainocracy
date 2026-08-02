/**
 * Tests for the modernized entry flow: Home, SignIn, SignUp, Dashboard.
 */
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  const { View } = require("react-native");
  return {
    ...actual,
    SafeAreaView: ({ children }: any) => <View>{children}</View>,
    SafeAreaProvider: ({ children }: any) => <View>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const mockOnLogin = jest.fn();
const mockOnRegister = jest.fn();
const mockOnLogOut = jest.fn();

jest.mock("src/context/AuthContext", () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    onLogin: mockOnLogin,
    onRegister: mockOnRegister,
    onLogOut: mockOnLogOut,
    authState: { authenticated: true, email: "voter@example.com" },
    isLoading: false,
    imageList: {},
    setImageList: jest.fn(),
  }),
}));

import { Dashboard } from "src/screens/Dashboard";
import { Home } from "src/screens/Home";
import { SignIn } from "src/screens/SignIn";
import { SignUp } from "src/screens/SignUp";

const nav = () => ({
  navigate: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
});

beforeEach(() => {
  mockOnLogin.mockReset();
  mockOnRegister.mockReset();
  mockOnLogOut.mockReset();
});

describe("Home screen", () => {
  it("renders the hero and routes to sign up / sign in", () => {
    const navigation = nav();
    const { getByText } = render(<Home navigation={navigation} />);
    expect(getByText(/Elections you can count on/i)).toBeTruthy();

    fireEvent.press(getByText("Create account"));
    expect(navigation.navigate).toHaveBeenCalledWith("SignUp");

    fireEvent.press(getByText("Sign in"));
    expect(navigation.navigate).toHaveBeenCalledWith("SignIn");
  });
});

describe("SignIn screen", () => {
  it("validates empty fields", () => {
    const { getByText, getByRole } = render(<SignIn navigation={nav()} />);
    fireEvent.press(getByRole("button", { name: "Sign in" }));
    expect(getByText(/Enter your electoral ID and password/i)).toBeTruthy();
    expect(mockOnLogin).not.toHaveBeenCalled();
  });

  it("calls onLogin and resets to Dashboard on success", async () => {
    mockOnLogin.mockResolvedValue({ success: true });
    const navigation = nav();
    const { getByRole, UNSAFE_getAllByType } = render(
      <SignIn navigation={navigation} />,
    );
    const { TextInput } = require("react-native");
    const inputs = UNSAFE_getAllByType(TextInput);
    fireEvent.changeText(inputs[0], "EL-1");
    fireEvent.changeText(inputs[1], "secret");
    fireEvent.press(getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(mockOnLogin).toHaveBeenCalledWith("EL-1", "secret"),
    );
    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Dashboard" }],
      }),
    );
  });
});

describe("SignUp screen", () => {
  it("blocks submission until all fields are filled", () => {
    const { getByText } = render(<SignUp navigation={nav()} />);
    fireEvent.press(getByText("Create account"));
    expect(getByText(/Fill in every field/i)).toBeTruthy();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it("registers and navigates to sign in on success", async () => {
    mockOnRegister.mockResolvedValue({ success: true });
    const navigation = nav();
    const { getByText, UNSAFE_getAllByType, UNSAFE_getByType } = render(
      <SignUp navigation={navigation} />,
    );
    const { TextInput, Alert } = require("react-native");
    const { Picker } = require("@react-native-picker/picker");
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation((_title: any, _msg: any, buttons: any) => {
        buttons?.[0]?.onPress?.();
      });

    const inputs = UNSAFE_getAllByType(TextInput);
    ["Ada", "ada@x.com", "12 St", "secret"].forEach((v, i) =>
      fireEvent.changeText(inputs[i], v),
    );
    fireEvent(UNSAFE_getByType(Picker), "valueChange", "California");
    fireEvent.press(getByText("Create account"));

    await waitFor(() =>
      expect(mockOnRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          electoralId: expect.stringMatching(/^[A-Z]{3}\d{6}$/),
          province: "California",
        }),
      ),
    );
    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith("SignIn"),
    );
    alertSpy.mockRestore();
  });
});

describe("Dashboard screen", () => {
  it("greets the user and enters voting", () => {
    const navigation = nav();
    const { getByText } = render(<Dashboard navigation={navigation} />);
    expect(getByText(/Welcome back/i)).toBeTruthy();
    fireEvent.press(getByText("Enter voting"));
    expect(navigation.navigate).toHaveBeenCalledWith("Menu");
  });

  it("signs out and resets to Home", async () => {
    mockOnLogOut.mockResolvedValue({ success: true });
    const navigation = nav();
    const { getByText } = render(<Dashboard navigation={navigation} />);
    fireEvent.press(getByText("Sign out"));
    await waitFor(() => expect(mockOnLogOut).toHaveBeenCalled());
    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: "Home" }],
      }),
    );
  });
});

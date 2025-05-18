/**
 * Tests for Login screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from 'src/screens/Login';
import { AuthProvider } from 'src/context/AuthContext';
import { mockAxios } from '../fixtures/mockAxios';
import { mockSecureStore } from '../fixtures/mockSecureStore';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('Login Screen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSecureStore.resetStore();
    mockAxios.mockClear();
    mockNavigate.mockClear();
  });

  test('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    expect(getByPlaceholderText('Electoral ID')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  test('handles input changes', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const passwordInput = getByPlaceholderText('Password');

    fireEvent.changeText(electoralIdInput, 'test-id');
    fireEvent.changeText(passwordInput, 'test-password');

    expect(electoralIdInput.props.value).toBe('test-id');
    expect(passwordInput.props.value).toBe('test-password');
  });

  test('navigates to registration screen when register button is pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('Registration');
  });

  test('submits login form with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(electoralIdInput, 'valid-id');
    fireEvent.changeText(passwordInput, 'valid-password');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/committee/auth-mobile', {
        electoralId: 'valid-id',
        password: 'valid-password'
      });
      expect(mockNavigate).toHaveBeenCalledWith('TwoFactor');
    });
  });

  test('shows error message with invalid credentials', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(electoralIdInput, 'invalid-id');
    fireEvent.changeText(passwordInput, 'invalid-password');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/committee/auth-mobile', {
        electoralId: 'invalid-id',
        password: 'invalid-password'
      });
    });

    const errorMessage = await findByText('Invalid credentials');
    expect(errorMessage).toBeTruthy();
  });

  test('validates required fields before submission', async () => {
    const { getByText, findByText } = render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );

    const loginButton = getByText('Login');
    fireEvent.press(loginButton);

    const errorMessage = await findByText('Electoral ID and password are required');
    expect(errorMessage).toBeTruthy();
    expect(mockAxios.post).not.toHaveBeenCalled();
  });
});

/**
 * Tests for Registration screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Registration from 'src/screens/Registration';
import { AuthProvider } from 'src/context/AuthContext';
import { mockAxios } from '../fixtures/mockAxios';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

describe('Registration Screen', () => {
  beforeEach(() => {
    mockAxios.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('renders registration form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    expect(getByPlaceholderText('Electoral ID')).toBeTruthy();
    expect(getByPlaceholderText('Full Name')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Address')).toBeTruthy();
    expect(getByPlaceholderText('Province')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
    expect(getByText('Back to Login')).toBeTruthy();
  });

  test('handles input changes', () => {
    const { getByPlaceholderText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const addressInput = getByPlaceholderText('Address');
    const provinceInput = getByPlaceholderText('Province');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');

    fireEvent.changeText(electoralIdInput, 'test-id');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(addressInput, '123 Test St');
    fireEvent.changeText(provinceInput, 'Test Province');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');

    expect(electoralIdInput.props.value).toBe('test-id');
    expect(nameInput.props.value).toBe('Test User');
    expect(emailInput.props.value).toBe('test@example.com');
    expect(addressInput.props.value).toBe('123 Test St');
    expect(provinceInput.props.value).toBe('Test Province');
    expect(passwordInput.props.value).toBe('password123');
    expect(confirmPasswordInput.props.value).toBe('password123');
  });

  test('navigates back to login when back button is pressed', () => {
    const { getByText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const backButton = getByText('Back to Login');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  test('validates required fields before submission', async () => {
    const { getByText, findByText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const registerButton = getByText('Register');
    fireEvent.press(registerButton);

    const errorMessage = await findByText('All fields are required');
    expect(errorMessage).toBeTruthy();
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  test('validates password match before submission', async () => {
    const { getByText, getByPlaceholderText, findByText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const addressInput = getByPlaceholderText('Address');
    const provinceInput = getByPlaceholderText('Province');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(electoralIdInput, 'test-id');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(addressInput, '123 Test St');
    fireEvent.changeText(provinceInput, 'Test Province');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'different-password');
    fireEvent.press(registerButton);

    const errorMessage = await findByText('Passwords do not match');
    expect(errorMessage).toBeTruthy();
    expect(mockAxios.post).not.toHaveBeenCalled();
  });

  test('submits registration form with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const addressInput = getByPlaceholderText('Address');
    const provinceInput = getByPlaceholderText('Province');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(electoralIdInput, 'test-id');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(addressInput, '123 Test St');
    fireEvent.changeText(provinceInput, 'Test Province');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/committee/register-voter', expect.objectContaining({
        electoralId: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        address: '123 Test St',
        province: 'Test Province',
        password: 'password123'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  test('handles registration failure', async () => {
    // Mock registration failure
    mockAxios.post.mockImplementationOnce(() => 
      Promise.reject({
        response: {
          status: 400,
          data: {
            msg: 'Registration failed'
          }
        }
      })
    );

    const { getByText, getByPlaceholderText, findByText } = render(
      <AuthProvider>
        <Registration />
      </AuthProvider>
    );

    const electoralIdInput = getByPlaceholderText('Electoral ID');
    const nameInput = getByPlaceholderText('Full Name');
    const emailInput = getByPlaceholderText('Email');
    const addressInput = getByPlaceholderText('Address');
    const provinceInput = getByPlaceholderText('Province');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const registerButton = getByText('Register');

    fireEvent.changeText(electoralIdInput, 'test-id');
    fireEvent.changeText(nameInput, 'Test User');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(addressInput, '123 Test St');
    fireEvent.changeText(provinceInput, 'Test Province');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(registerButton);

    const errorMessage = await findByText('Registration failed');
    expect(errorMessage).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

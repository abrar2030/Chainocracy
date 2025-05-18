/**
 * Tests for TwoFactor screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TwoFactor from 'src/screens/TwoFactor';
import { AuthProvider } from 'src/context/AuthContext';

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

// Mock QR code generation
jest.mock('qrcode', () => ({
  toDataURL: jest.fn((url, callback) => callback(null, 'data:image/png;base64,test-qr-code'))
}));

describe('TwoFactor Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  test('renders two-factor authentication screen correctly', () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    expect(getByText('Two-Factor Authentication')).toBeTruthy();
    expect(getByText('Scan the QR code with your authenticator app')).toBeTruthy();
    expect(getByTestId('otp-input')).toBeTruthy();
    expect(getByText('Verify')).toBeTruthy();
  });

  test('handles OTP input changes', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    fireEvent.changeText(otpInput, '123456');
    expect(otpInput.props.value).toBe('123456');
  });

  test('validates OTP length before submission', async () => {
    const { getByText, getByTestId, findByText } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    const verifyButton = getByText('Verify');

    // Enter too short OTP
    fireEvent.changeText(otpInput, '123');
    fireEvent.press(verifyButton);

    const errorMessage = await findByText('OTP must be 6 digits');
    expect(errorMessage).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('validates OTP format before submission', async () => {
    const { getByText, getByTestId, findByText } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    const verifyButton = getByText('Verify');

    // Enter non-numeric OTP
    fireEvent.changeText(otpInput, 'abcdef');
    fireEvent.press(verifyButton);

    const errorMessage = await findByText('OTP must contain only digits');
    expect(errorMessage).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('submits valid OTP and navigates to candidates screen', async () => {
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('Candidates');
    });
  });

  test('handles verification failure', async () => {
    // Mock verification failure
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ verified: false })
      })
    );

    const { getByText, getByTestId, findByText } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    const errorMessage = await findByText('Invalid OTP. Please try again.');
    expect(errorMessage).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles network errors during verification', async () => {
    // Mock network error
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const { getByText, getByTestId, findByText } = render(
      <AuthProvider>
        <TwoFactor />
      </AuthProvider>
    );

    const otpInput = getByTestId('otp-input');
    const verifyButton = getByText('Verify');

    fireEvent.changeText(otpInput, '123456');
    fireEvent.press(verifyButton);

    const errorMessage = await findByText('Verification failed. Please try again.');
    expect(errorMessage).toBeTruthy();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

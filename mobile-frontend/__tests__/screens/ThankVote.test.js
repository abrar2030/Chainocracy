/**
 * Tests for ThankVote screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ThankVote from 'src/screens/ThankVote';
import { AuthProvider } from 'src/context/AuthContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockReset = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigate,
      reset: mockReset,
    }),
  };
});

describe('ThankVote Screen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockReset.mockClear();
  });

  test('renders thank you message correctly', () => {
    const { getByText } = render(
      <AuthProvider>
        <ThankVote />
      </AuthProvider>
    );

    expect(getByText('Thank You for Voting!')).toBeTruthy();
    expect(getByText('Your vote has been securely recorded.')).toBeTruthy();
    expect(getByText('Return to Home')).toBeTruthy();
  });

  test('navigates to home screen when button is pressed', async () => {
    const { getByText } = render(
      <AuthProvider>
        <ThankVote />
      </AuthProvider>
    );

    const homeButton = getByText('Return to Home');
    fireEvent.press(homeButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Candidates' }],
      });
    });
  });

  test('displays confetti animation', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <ThankVote />
      </AuthProvider>
    );

    expect(getByTestId('confetti-animation')).toBeTruthy();
  });

  test('handles automatic navigation after timeout', async () => {
    // Mock setTimeout
    jest.useFakeTimers();

    render(
      <AuthProvider>
        <ThankVote />
      </AuthProvider>
    );

    // Fast-forward timer
    jest.advanceTimersByTime(10000);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Candidates' }],
      });
    });

    // Restore timers
    jest.useRealTimers();
  });
});

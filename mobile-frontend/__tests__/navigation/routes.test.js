/**
 * Tests for Navigation
 */
import React from 'react';
import { render, act } from '@testing-library/react-native';
import AppRoutes from 'src/routes/app.routes';
import { AuthProvider } from 'src/context/AuthContext';
import { mockSecureStore } from '../fixtures/mockSecureStore';

// Mock react-navigation
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children }) => <div data-testid="stack-navigator">{children}</div>,
    Screen: ({ name }) => <div data-testid={`screen-${name}`}>{name}</div>,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({ children }) => <div data-testid="navigation-container">{children}</div>,
}));

// Mock screens
jest.mock('src/screens/Login', () => 'Login');
jest.mock('src/screens/Registration', () => 'Registration');
jest.mock('src/screens/TwoFactor', () => 'TwoFactor');
jest.mock('src/screens/Candidates', () => 'Candidates');
jest.mock('src/screens/CandidateDetails', () => 'CandidateDetails');
jest.mock('src/screens/News', () => 'News');
jest.mock('src/screens/ThankVote', () => 'ThankVote');
jest.mock('src/screens/Credentials', () => 'Credentials');
jest.mock('src/screens/Groups', () => 'Groups');

describe('Navigation', () => {
  beforeEach(() => {
    mockSecureStore.resetStore();
  });

  test('renders navigation container', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    );

    expect(getByTestId('navigation-container')).toBeTruthy();
    expect(getByTestId('stack-navigator')).toBeTruthy();
  });

  test('includes all required screens', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    );

    expect(getByTestId('screen-Login')).toBeTruthy();
    expect(getByTestId('screen-Registration')).toBeTruthy();
    expect(getByTestId('screen-TwoFactor')).toBeTruthy();
    expect(getByTestId('screen-Candidates')).toBeTruthy();
    expect(getByTestId('screen-CandidateDetails')).toBeTruthy();
    expect(getByTestId('screen-News')).toBeTruthy();
    expect(getByTestId('screen-ThankVote')).toBeTruthy();
    expect(getByTestId('screen-Credentials')).toBeTruthy();
    expect(getByTestId('screen-Groups')).toBeTruthy();
  });
});

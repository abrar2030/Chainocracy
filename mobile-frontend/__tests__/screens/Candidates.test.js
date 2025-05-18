/**
 * Tests for Candidates screen
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Candidates from 'src/screens/Candidates';
import { AuthProvider } from 'src/context/AuthContext';
import { mockAxios } from '../fixtures/mockAxios';

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

// Mock CandidatesList component
jest.mock('src/components/CandidatesList', () => {
  return function MockCandidatesList({ candidates, onSelectCandidate }) {
    return (
      <div data-testid="candidates-list">
        {candidates.map(candidate => (
          <button 
            key={candidate.id} 
            data-testid={`candidate-${candidate.id}`}
            onClick={() => onSelectCandidate(candidate)}
          >
            {candidate.name}
          </button>
        ))}
      </div>
    );
  };
});

describe('Candidates Screen', () => {
  const mockCandidates = [
    { id: '1', name: 'Candidate 1', party: 'Party A', code: 101 },
    { id: '2', name: 'Candidate 2', party: 'Party B', code: 102 },
    { id: '3', name: 'Candidate 3', party: 'Party C', code: 103 }
  ];

  beforeEach(() => {
    mockNavigate.mockClear();
    mockAxios.mockClear();
    
    // Mock API response for candidates
    mockAxios.get.mockImplementation((url) => {
      if (url.includes('candidates')) {
        return Promise.resolve({
          status: 200,
          data: mockCandidates
        });
      }
      return Promise.resolve({ status: 200, data: {} });
    });
  });

  test('renders candidates screen with loading state initially', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  test('fetches and displays candidates', async () => {
    const { getByTestId, queryByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    // Initially shows loading
    expect(getByTestId('loading-indicator')).toBeTruthy();

    // Wait for candidates to load
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByTestId('candidates-list')).toBeTruthy();
    });

    expect(mockAxios.get).toHaveBeenCalledWith(expect.stringContaining('candidates'));
  });

  test('navigates to candidate details when a candidate is selected', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    // Wait for candidates to load
    await waitFor(() => {
      expect(getByTestId('candidates-list')).toBeTruthy();
    });

    // Click on a candidate
    fireEvent.click(getByTestId('candidate-1'));

    expect(mockNavigate).toHaveBeenCalledWith('CandidateDetails', { 
      candidate: mockCandidates[0] 
    });
  });

  test('handles empty candidates list', async () => {
    // Mock empty candidates response
    mockAxios.get.mockImplementationOnce((url) => {
      if (url.includes('candidates')) {
        return Promise.resolve({
          status: 200,
          data: []
        });
      }
      return Promise.resolve({ status: 200, data: {} });
    });

    const { getByText, queryByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    expect(getByText('No candidates available')).toBeTruthy();
  });

  test('handles API error when fetching candidates', async () => {
    // Mock API error
    mockAxios.get.mockImplementationOnce((url) => {
      if (url.includes('candidates')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ status: 200, data: {} });
    });

    const { getByText, queryByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    expect(getByText('Failed to load candidates. Please try again.')).toBeTruthy();
  });

  test('shows refresh button after API error', async () => {
    // Mock API error
    mockAxios.get.mockImplementationOnce((url) => {
      if (url.includes('candidates')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ status: 200, data: {} });
    });

    const { getByText, queryByTestId } = render(
      <AuthProvider>
        <Candidates />
      </AuthProvider>
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
    });

    const refreshButton = getByText('Refresh');
    expect(refreshButton).toBeTruthy();

    // Reset mock to return candidates on next call
    mockAxios.get.mockImplementationOnce((url) => {
      if (url.includes('candidates')) {
        return Promise.resolve({
          status: 200,
          data: mockCandidates
        });
      }
      return Promise.resolve({ status: 200, data: {} });
    });

    // Click refresh button
    fireEvent.press(refreshButton);

    // Should show loading again
    expect(getByTestId('loading-indicator')).toBeTruthy();

    // Wait for candidates to load
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByTestId('candidates-list')).toBeTruthy();
    });
  });
});

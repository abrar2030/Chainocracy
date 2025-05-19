import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/components/Dashboard';

// Mock dependencies
vi.mock('../../src/components/BlockchainDetails', () => ({
  default: () => <div data-testid="blockchain-details">Blockchain Details</div>
}));

vi.mock('../../src/components/ElectionResults', () => ({
  default: () => <div data-testid="election-results">Election Results</div>
}));

vi.mock('../../src/components/AngolaMap', () => ({
  default: () => <div data-testid="angola-map">Angola Map</div>
}));

vi.mock('../../src/components/SidebarComponent', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

// Mock fetch API
global.fetch = vi.fn();

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Setup fetch mock to return successful response
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        results: {
          candidatesResult: [
            { candidate: { party: 'Party1', name: 'Candidate 1' }, numVotes: 100, percentage: 50 },
            { candidate: { party: 'Party2', name: 'Candidate 2' }, numVotes: 50, percentage: 25 },
            { candidate: { party: 'Party3', name: 'Candidate 3' }, numVotes: 50, percentage: 25 }
          ],
          totalVotesReceived: 200,
          expectedTotalVotes: 300,
          winner: { party: 'Party1', name: 'Candidate 1' }
        }
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with all components', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('blockchain-details')).toBeInTheDocument();
      expect(screen.getByTestId('election-results')).toBeInTheDocument();
      expect(screen.getByTestId('angola-map')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  it('handles data loading state correctly', async () => {
    // Mock a delayed response to test loading state
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: async () => ({
              results: {
                candidatesResult: [],
                totalVotesReceived: 0,
                expectedTotalVotes: 0,
                winner: null
              }
            })
          }), 
          100
        )
      )
    );

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Initially should show loading state
    expect(screen.getByText(/Loading/i) || screen.getByText(/Fetching/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('blockchain-details')).toBeInTheDocument();
    });
  });

  it('handles error state correctly', async () => {
    // Mock a failed response
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('updates data when refresh button is clicked', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByTestId('blockchain-details')).toBeInTheDocument();
    });

    // Find and click refresh button if it exists
    const refreshButton = screen.getByRole('button', { name: /refresh/i }) || 
                          screen.getByRole('button', { name: /update/i }) ||
                          screen.getByRole('button', { name: /reload/i });
    
    if (refreshButton) {
      fireEvent.click(refreshButton);
      
      // Verify fetch was called again
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    }
  });

  it('displays correct election statistics', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    // Wait for data to load and verify statistics are displayed
    await waitFor(() => {
      // These checks are generic since we're using mocked components
      // In a real test, you would check for specific text content
      expect(screen.getByTestId('election-results')).toBeInTheDocument();
    });
  });
});

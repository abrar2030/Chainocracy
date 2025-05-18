import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BlockchainDetails from '@/screens/BlockchainDetails';
import { BrowserRouter, useParams } from 'react-router-dom';
import axios from 'axios';

// Mock the useParams hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

// Mock axios
vi.mock('axios');

// Mock components used in BlockchainDetails
vi.mock('@/tables/transactions_block_details/page', () => ({
  default: () => <div data-testid="transactions-details">Transactions Details Component</div>
}));

describe('BlockchainDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useParams to return a blockId
    (useParams as jest.Mock).mockReturnValue({ blockId: '123' });
    
    // Mock axios.get to return block data
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        block: {
          index: 123,
          timestamp: 1621234567890,
          transactions: [{ id: 'tx1' }, { id: 'tx2' }],
          nonce: 12345,
          hash: '0x123abc',
          previousBlockHash: '0x456def'
        }
      }
    });
  });

  it('renders block details when data is loaded', async () => {
    render(
      <BrowserRouter>
        <BlockchainDetails />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if block details are displayed
    expect(screen.getByText(/Block #123/i)).toBeInTheDocument();
    expect(screen.getByText(/0x123abc/i)).toBeInTheDocument();
    expect(screen.getByText(/0x456def/i)).toBeInTheDocument();
    expect(screen.getByTestId('transactions-details')).toBeInTheDocument();
  });

  it('handles error when fetching block data fails', async () => {
    // Mock axios.get to throw an error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <BlockchainDetails />
      </BrowserRouter>
    );

    // Wait for the error to be handled
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if error message is displayed
    expect(screen.getByText(/Error loading block details/i)).toBeInTheDocument();
  });

  it('displays loading state before data is fetched', () => {
    // Delay the axios response
    (axios.get as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <BrowserRouter>
        <BlockchainDetails />
      </BrowserRouter>
    );

    // Check if loading indicator is displayed
    expect(screen.getByText(/Loading block details/i)).toBeInTheDocument();
  });
});

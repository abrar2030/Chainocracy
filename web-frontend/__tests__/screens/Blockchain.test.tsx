import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Blockchain from '@/screens/Blockchain';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock the components that are used in Blockchain component
vi.mock('@/components/blockchain-list/BlockList', () => ({
  default: () => <div data-testid="block-list">Block List Component</div>
}));

vi.mock('@/tables/blocks_table/page', () => ({
  default: () => <div data-testid="table-blocks">Blocks Table Component</div>
}));

vi.mock('@/tables/blocks_table/LineChartCustomized', () => ({
  default: () => <div data-testid="line-chart">Line Chart Component</div>
}));

vi.mock('@/tables/transactions_table/page', () => ({
  default: () => <div data-testid="table-transactions">Transactions Table Component</div>
}));

vi.mock('@/tables/pending_transactions_table/page', () => ({
  default: () => <div data-testid="table-pending-transactions">Pending Transactions Table Component</div>
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Toaster Component</div>
}));

vi.mock('axios');

describe('Blockchain Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all blockchain components', () => {
    render(
      <BrowserRouter>
        <Blockchain />
      </BrowserRouter>
    );

    // Check if all components are rendered
    expect(screen.getByText('Blockchain')).toBeInTheDocument();
    expect(screen.getByTestId('block-list')).toBeInTheDocument();
    expect(screen.getByTestId('table-blocks')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('table-transactions')).toBeInTheDocument();
    expect(screen.getByTestId('table-pending-transactions')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('updates range input value when changed', () => {
    render(
      <BrowserRouter>
        <Blockchain />
      </BrowserRouter>
    );

    const rangeInput = screen.getByRole('textbox');
    fireEvent.change(rangeInput, { target: { value: '3000-3005' } });
    expect(rangeInput).toHaveValue('3000-3005');
  });

  it('calls mine blocks API when Mine Block button is clicked', async () => {
    // Mock axios.get and CancelToken
    const mockGet = vi.fn().mockResolvedValue({ status: 200, data: { success: true } });
    axios.get = mockGet;
    axios.CancelToken = {
      source: () => ({
        token: 'mock-token',
        cancel: vi.fn()
      })
    };
    
    // Mock axios.interceptors
    axios.interceptors = {
      response: {
        use: vi.fn()
      }
    };

    render(
      <BrowserRouter>
        <Blockchain />
      </BrowserRouter>
    );

    // Change range input
    const rangeInput = screen.getByRole('textbox');
    fireEvent.change(rangeInput, { target: { value: '3010-3011' } });
    
    // Click mine block button
    const mineButton = screen.getByRole('button', { name: /Mine Block/i });
    fireEvent.click(mineButton);

    // Verify that axios.get was called with the correct URLs
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('http://localhost:3010/api/blockchain/mine');
      expect(mockGet).toHaveBeenCalledWith('http://localhost:3011/api/blockchain/mine');
    });
  });

  it('handles empty range input', () => {
    render(
      <BrowserRouter>
        <Blockchain />
      </BrowserRouter>
    );

    // Clear range input
    const rangeInput = screen.getByRole('textbox');
    fireEvent.change(rangeInput, { target: { value: '' } });
    
    // Click mine block button
    const mineButton = screen.getByRole('button', { name: /Mine Block/i });
    fireEvent.click(mineButton);

    // Verify that axios.get was not called
    expect(axios.get).not.toHaveBeenCalled();
  });
});

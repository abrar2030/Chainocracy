import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Voters from '@/screens/Voters';
import axios from 'axios';

// Mock components used in Voters screen
vi.mock('@/tables/voters_table/page', () => ({
  default: () => <div data-testid="voters-table">Voters Table Component</div>
}));

vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('axios');

describe('Voters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.get to return voters data
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        voters: [
          { id: 1, name: 'John Doe', status: 'verified' },
          { id: 2, name: 'Jane Smith', status: 'pending' }
        ]
      }
    });
  });

  it('renders voters screen with title and table', () => {
    render(
      <BrowserRouter>
        <Voters />
      </BrowserRouter>
    );

    expect(screen.getByText(/Voters/i)).toBeInTheDocument();
    expect(screen.getByTestId('voters-table')).toBeInTheDocument();
  });

  it('displays load/refresh button', () => {
    render(
      <BrowserRouter>
        <Voters />
      </BrowserRouter>
    );

    const loadButton = screen.getByRole('button', { name: /Load \/ Refresh Voters/i });
    expect(loadButton).toBeInTheDocument();
  });

  it('calls API when load/refresh button is clicked', () => {
    render(
      <BrowserRouter>
        <Voters />
      </BrowserRouter>
    );

    const loadButton = screen.getByRole('button', { name: /Load \/ Refresh Voters/i });
    fireEvent.click(loadButton);

    expect(axios.get).toHaveBeenCalled();
  });
});

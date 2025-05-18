import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CandidateDetails from '@/screens/CandidateDetails';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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

describe('CandidateDetails Component', () => {
  const mockCandidate = {
    id: '123',
    name: 'John Doe',
    party: 'Democratic Party',
    position: 'President',
    votes: 1234,
    image: 'https://example.com/image.jpg',
    biography: 'This is a test biography',
    manifesto: 'This is a test manifesto',
    status: 'active'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useParams to return a candidateId
    (useParams as jest.Mock).mockReturnValue({ candidateId: '123' });
    
    // Mock axios.get to return candidate data
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        candidate: mockCandidate
      }
    });
  });

  it('renders candidate details when data is loaded', async () => {
    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if candidate details are displayed
    expect(screen.getByText(mockCandidate.name)).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.party)).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.position)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockCandidate.votes.toString()))).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.biography)).toBeInTheDocument();
    expect(screen.getByText(mockCandidate.manifesto)).toBeInTheDocument();
  });

  it('handles error when fetching candidate data fails', async () => {
    // Mock axios.get to throw an error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Wait for the error to be handled
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if error message is displayed
    expect(screen.getByText(/Error loading candidate details/i)).toBeInTheDocument();
  });

  it('displays loading state before data is fetched', () => {
    // Delay the axios response
    (axios.get as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Check if loading indicator is displayed
    expect(screen.getByText(/Loading candidate details/i)).toBeInTheDocument();
  });

  it('navigates back when back button is clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useParams: () => ({ candidateId: '123' }),
        useNavigate: () => mockNavigate
      };
    });

    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Find and click the back button
    const backButton = screen.getByRole('button', { name: /Back/i });
    fireEvent.click(backButton);

    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('renders candidate image when available', async () => {
    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if candidate image is displayed
    const candidateImage = screen.getByAltText(mockCandidate.name);
    expect(candidateImage).toBeInTheDocument();
    expect(candidateImage).toHaveAttribute('src', mockCandidate.image);
  });

  it('handles case when candidate has no votes', async () => {
    // Mock axios.get to return candidate with no votes
    const candidateWithNoVotes = { ...mockCandidate, votes: 0 };
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        candidate: candidateWithNoVotes
      }
    });

    render(
      <BrowserRouter>
        <CandidateDetails />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if zero votes are displayed correctly
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import PublicAnnouncement from '@/screens/PublicAnnouncement';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('PublicAnnouncement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.get to return announcement data
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        announcements: [
          {
            id: '1',
            title: 'Election Day',
            content: 'Election will be held on June 1st',
            date: '2025-05-15',
            author: 'Election Commission'
          },
          {
            id: '2',
            title: 'Voter Registration',
            content: 'Registration closes on May 25th',
            date: '2025-05-10',
            author: 'Election Commission'
          }
        ]
      }
    });
  });

  it('renders public announcements page with title', () => {
    render(
      <BrowserRouter>
        <PublicAnnouncement />
      </BrowserRouter>
    );

    expect(screen.getByText(/Public Announcements/i)).toBeInTheDocument();
  });

  it('loads and displays announcements', async () => {
    render(
      <BrowserRouter>
        <PublicAnnouncement />
      </BrowserRouter>
    );

    // Wait for announcements to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if announcements are displayed
    expect(screen.getByText('Election Day')).toBeInTheDocument();
    expect(screen.getByText('Voter Registration')).toBeInTheDocument();
    expect(screen.getByText('Election will be held on June 1st')).toBeInTheDocument();
    expect(screen.getByText('Registration closes on May 25th')).toBeInTheDocument();
  });

  it('displays loading state while fetching announcements', () => {
    // Delay the axios response
    (axios.get as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <BrowserRouter>
        <PublicAnnouncement />
      </BrowserRouter>
    );

    // Check if loading indicator is displayed
    expect(screen.getByText(/Loading announcements/i)).toBeInTheDocument();
  });

  it('handles error when fetching announcements fails', async () => {
    // Mock axios.get to throw an error
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <PublicAnnouncement />
      </BrowserRouter>
    );

    // Wait for the error to be handled
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Check if error message is displayed
    expect(screen.getByText(/Error loading announcements/i)).toBeInTheDocument();
  });

  it('displays announcement details when clicked', async () => {
    render(
      <BrowserRouter>
        <PublicAnnouncement />
      </BrowserRouter>
    );

    // Wait for announcements to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Click on an announcement
    fireEvent.click(screen.getByText('Election Day'));

    // Check if details are displayed
    expect(screen.getByText('Election will be held on June 1st')).toBeInTheDocument();
    expect(screen.getByText('Election Commission')).toBeInTheDocument();
    expect(screen.getByText('2025-05-15')).toBeInTheDocument();
  });
});

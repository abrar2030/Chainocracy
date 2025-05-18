import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import AnnounceElection from '@/screens/AnnounceElection';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  default: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({
      user: { name: 'Test User', role: 'admin' },
      isLoggedIn: () => true
    })
  },
  useAuth: () => ({
    user: { name: 'Test User', role: 'admin' },
    isLoggedIn: () => true
  })
}));

describe('AnnounceElection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.post to return success
    (axios.post as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        message: 'Announcement created successfully'
      }
    });
  });

  it('renders announcement form with all fields', () => {
    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Check if form fields are rendered
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Announcement/i })).toBeInTheDocument();
  });

  it('allows entering announcement details', () => {
    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Enter title
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Announcement' } });
    expect(titleInput).toHaveValue('Test Announcement');
    
    // Enter content
    const contentInput = screen.getByLabelText(/Content/i);
    fireEvent.change(contentInput, { target: { value: 'This is a test announcement' } });
    expect(contentInput).toHaveValue('This is a test announcement');
  });

  it('submits form with announcement data', async () => {
    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Enter announcement details
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Announcement' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a test announcement' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Announcement/i }));
    
    // Check if axios.post was called with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          title: 'Test Announcement',
          content: 'This is a test announcement'
        }),
        expect.any(Object)
      );
    });
  });

  it('displays success message after successful submission', async () => {
    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Enter announcement details
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Announcement' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a test announcement' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Announcement/i }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Announcement created successfully/i)).toBeInTheDocument();
    });
  });

  it('handles error during announcement submission', async () => {
    // Mock axios.post to return error
    (axios.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'Failed to create announcement'
        }
      }
    });

    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Enter announcement details
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Announcement' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a test announcement' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Announcement/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to create announcement/i)).toBeInTheDocument();
    });
  });

  it('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <AnnounceElection />
      </BrowserRouter>
    );

    // Submit form without entering any data
    fireEvent.click(screen.getByRole('button', { name: /Submit Announcement/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Content is required/i)).toBeInTheDocument();
    });
    
    // Verify that axios.post was not called
    expect(axios.post).not.toHaveBeenCalled();
  });
});

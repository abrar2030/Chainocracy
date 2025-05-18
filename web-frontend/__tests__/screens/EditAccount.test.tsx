import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import EditAccount from '@/screens/EditAccount';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock the AuthContext
vi.mock('@/context/AuthContext', () => ({
  default: {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children({
      user: { name: 'Test User', username: 'testuser', role: 'admin' },
      updateUser: vi.fn()
    })
  },
  useAuth: () => ({
    user: { name: 'Test User', username: 'testuser', role: 'admin' },
    updateUser: vi.fn()
  })
}));

describe('EditAccount Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock axios.put to return success
    (axios.put as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        message: 'Account updated successfully'
      }
    });
  });

  it('renders account edit form with user data', () => {
    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Check if form fields are rendered with user data
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/Username/i)).toHaveValue('testuser');
    expect(screen.getByRole('button', { name: /Update Account/i })).toBeInTheDocument();
  });

  it('allows editing user information', () => {
    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Edit name field
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    expect(nameInput).toHaveValue('Updated Name');
    
    // Edit username field
    const usernameInput = screen.getByLabelText(/Username/i);
    fireEvent.change(usernameInput, { target: { value: 'updateduser' } });
    expect(usernameInput).toHaveValue('updateduser');
  });

  it('submits form with updated data', async () => {
    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Edit fields
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated Name' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'updateduser' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Account/i }));
    
    // Check if axios.put was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          name: 'Updated Name',
          username: 'updateduser'
        }),
        expect.any(Object)
      );
    });
  });

  it('displays success message after successful update', async () => {
    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Account/i }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Account updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles error during account update', async () => {
    // Mock axios.put to return error
    (axios.put as jest.Mock).mockRejectedValue({
      response: {
        data: {
          message: 'Failed to update account'
        }
      }
    });

    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Account/i }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to update account/i)).toBeInTheDocument();
    });
  });

  it('validates form fields before submission', async () => {
    render(
      <BrowserRouter>
        <EditAccount />
      </BrowserRouter>
    );

    // Clear required fields
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: '' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Update Account/i }));
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument();
    });
    
    // Verify that axios.put was not called
    expect(axios.put).not.toHaveBeenCalled();
  });
});

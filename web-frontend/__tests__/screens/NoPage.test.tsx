import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import NoPage from '@/screens/NoPage';

describe('NoPage Component', () => {
  // Mock the AuthContext
  const mockAuthContext = {
    isLoggedIn: vi.fn(),
    onLogOut: vi.fn(),
    updateImages: vi.fn(),
    user: {
      name: 'Test User',
      role: 'admin'
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 404 page with error message', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <NoPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
  });

  it('displays return to home button', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(true);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <NoPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const homeButton = screen.getByRole('button', { name: /Return to Home/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('navigates to home page when button is clicked', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(true);
    
    // Mock useNavigate
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <NoPage />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    const homeButton = screen.getByRole('button', { name: /Return to Home/i });
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

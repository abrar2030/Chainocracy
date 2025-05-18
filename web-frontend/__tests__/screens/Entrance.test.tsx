import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';
import Entrance from '@/screens/Entrance';

describe('Entrance Component', () => {
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

  it('renders entrance page with welcome message', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Entrance />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome to the Blockchain Voting System/i)).toBeInTheDocument();
  });

  it('displays login and register options for non-logged in users', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(false);
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Entrance />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('redirects to dashboard for logged in users', () => {
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
          <Entrance />
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to login page when login button is clicked', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(false);
    
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
          <Entrance />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Click login button
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to register page when register button is clicked', () => {
    mockAuthContext.isLoggedIn.mockReturnValue(false);
    
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
          <Entrance />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Click register button
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    
    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});

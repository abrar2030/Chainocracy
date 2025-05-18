import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthContext from '@/context/AuthContext';

// Mock components
vi.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

describe('AuthContext', () => {
  // Sample auth provider wrapper for testing
  const AuthProvider = ({ children }) => {
    return (
      <AuthContext.Provider value={{
        user: { name: 'Test User', role: 'admin' },
        isLoggedIn: () => true,
        onLogIn: vi.fn(),
        onLogOut: vi.fn(),
        updateUser: vi.fn(),
        updateImages: vi.fn()
      }}>
        {children}
      </AuthContext.Provider>
    );
  };

  it('provides auth context to child components', () => {
    // Create a test component that consumes the context
    const TestComponent = () => {
      const auth = AuthContext.useAuth();
      return (
        <div>
          <div data-testid="user-name">{auth.user.name}</div>
          <div data-testid="user-role">{auth.user.role}</div>
          <button onClick={auth.onLogOut}>Logout</button>
        </div>
      );
    };

    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Check if context values are correctly provided
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    
    // Test logout function
    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutButton);
    
    // Since onLogOut is a mock function, we can check if it was called
    expect(AuthContext.useAuth().onLogOut).toHaveBeenCalled();
  });

  it('handles login state correctly', () => {
    // Create a test component with login state toggle
    const TestComponent = () => {
      const [isLoggedIn, setIsLoggedIn] = vi.useState(false);
      
      return (
        <AuthContext.Provider value={{
          user: isLoggedIn ? { name: 'Test User', role: 'admin' } : null,
          isLoggedIn: () => isLoggedIn,
          onLogIn: () => setIsLoggedIn(true),
          onLogOut: () => setIsLoggedIn(false)
        }}>
          <div data-testid="login-status">{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
          <button onClick={() => setIsLoggedIn(!isLoggedIn)}>Toggle Login</button>
        </AuthContext.Provider>
      );
    };

    render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    );

    // Check initial state
    expect(screen.getByTestId('login-status')).toHaveTextContent('Logged Out');
    
    // Toggle login state
    fireEvent.click(screen.getByRole('button', { name: /Toggle Login/i }));
    
    // Check updated state
    expect(screen.getByTestId('login-status')).toHaveTextContent('Logged In');
  });
});

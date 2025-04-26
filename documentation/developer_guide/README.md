# Developer Guide

This guide provides comprehensive information for developers working on the Chainocracy blockchain-based voting system.

## Development Environment Setup

### Prerequisites

- **Node.js** (v16+)
- **npm** or **yarn** package manager
- **Git** version control
- **Expo CLI** (for mobile development)
- **Code editor** (VS Code recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- React Native Tools
- Tailwind CSS IntelliSense
- Jest Runner

### Repository Structure

The Chainocracy repository is organized into the following main directories:

```
chainocracy/
├── backend-api/        # Backend API server
├── web-frontend/       # Web application for committee members
├── mobile-frontend/    # Mobile application for voters
├── docs/               # Project documentation
└── public/             # Public assets
```

## Coding Standards

### General Guidelines

- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for type safety
- Write self-documenting code with clear variable and function names
- Include JSDoc comments for all public functions and classes
- Keep functions small and focused on a single responsibility
- Write unit tests for all business logic

### TypeScript Guidelines

- Use explicit typing rather than relying on type inference
- Define interfaces for all data structures
- Use enums for values with a fixed set of options
- Leverage TypeScript's advanced features (generics, utility types)
- Avoid using `any` type unless absolutely necessary

### React/React Native Guidelines

- Use functional components with hooks
- Follow the container/presenter pattern for complex components
- Keep components small and focused on a single responsibility
- Use React Query for data fetching and caching
- Implement proper error handling and loading states
- Use React Context for global state management

### Backend Guidelines

- Follow RESTful API design principles
- Implement proper error handling and validation
- Use middleware for cross-cutting concerns
- Document all API endpoints with JSDoc comments
- Implement comprehensive logging
- Follow the repository pattern for data access

## Development Workflow

### Git Workflow

We follow a feature branch workflow:

1. Create a new branch for each feature or bug fix:
   ```bash
   git checkout -b feature/feature-name
   # or
   git checkout -b fix/bug-name
   ```

2. Make your changes and commit them with descriptive messages:
   ```bash
   git commit -m "feat: add voter verification feature"
   # or
   git commit -m "fix: resolve authentication token expiration issue"
   ```

3. Push your branch to the remote repository:
   ```bash
   git push origin feature/feature-name
   ```

4. Create a pull request for code review
5. After approval, merge the branch into the main branch

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if necessary
3. Request review from at least one team member
4. Address all review comments
5. Merge only after receiving approval

## Testing

### Backend Testing

We use Jest for backend testing:

```bash
cd backend-api
npm test
```

Test files should be placed in a `__tests__` directory or have a `.test.ts` or `.spec.ts` extension.

Example test:

```typescript
import request from 'supertest';
import app from '../src/app';

describe('Authentication API', () => {
  it('should return a JWT token when valid credentials are provided', async () => {
    const response = await request(app)
      .post('/api/committee/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### Web Frontend Testing

We use Vitest and Testing Library for web frontend testing:

```bash
cd web-frontend
npm test
```

Example test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('should call onSubmit with email and password when form is submitted', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Mobile Frontend Testing

We use Jest and Testing Library for mobile frontend testing:

```bash
cd mobile-frontend
npm test
```

Example test:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('should call login function with email and password when form is submitted', () => {
    const loginMock = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen login={loginMock} />
    );
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));
    
    expect(loginMock).toHaveBeenCalledWith('test@example.com', 'password123');
  });
});
```

### End-to-End Testing

We use Cypress for end-to-end testing of the web application:

```bash
cd web-frontend
npm run test:e2e
```

Example test:

```javascript
describe('Login Flow', () => {
  it('should allow a user to log in', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('committee@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });
});
```

## Blockchain Development

### Understanding the Blockchain Implementation

The Chainocracy blockchain is a custom implementation designed specifically for voting. Key components include:

- **Block**: Contains metadata and a list of transactions (votes)
- **Transaction**: Represents a vote from a voter to a candidate
- **Blockchain**: Manages the chain of blocks and consensus mechanism
- **Wallet**: Manages cryptographic keys for signing transactions

### Adding a New Transaction Type

To add a new transaction type:

1. Define the transaction interface in `src/blockchain/data_types.ts`:

```typescript
export interface CustomTransaction extends BaseTransaction {
  type: 'CUSTOM_TYPE';
  customData: {
    // Custom data fields
  };
}
```

2. Update the transaction validation logic in `src/blockchain/transaction.ts`:

```typescript
export function validateTransaction(transaction: Transaction): boolean {
  // Existing validation logic
  
  if (transaction.type === 'CUSTOM_TYPE') {
    // Custom validation logic
    return validateCustomTransaction(transaction as CustomTransaction);
  }
  
  return true;
}

function validateCustomTransaction(transaction: CustomTransaction): boolean {
  // Implement custom validation logic
  return true;
}
```

3. Update the transaction processing logic in `src/blockchain/blockchain.ts`:

```typescript
private processTransaction(transaction: Transaction): void {
  // Existing processing logic
  
  if (transaction.type === 'CUSTOM_TYPE') {
    // Custom processing logic
    this.processCustomTransaction(transaction as CustomTransaction);
  }
}

private processCustomTransaction(transaction: CustomTransaction): void {
  // Implement custom processing logic
}
```

### Modifying the Consensus Mechanism

The default consensus mechanism is Proof of Work. To modify it:

1. Update the `mineBlock` method in `src/blockchain/blockchain.ts`:

```typescript
public mineBlock(minerAddress: string): Block {
  // Implement your custom consensus mechanism
  // Example: Proof of Stake, Delegated Proof of Stake, etc.
}
```

2. Update the `isValidChain` method to validate blocks according to the new consensus rules:

```typescript
public isValidChain(chain: Block[]): boolean {
  // Validate the chain according to your custom consensus rules
}
```

## API Development

### Adding a New API Endpoint

To add a new API endpoint:

1. Create a new route file or add to an existing one in `src/routes/`:

```typescript
import express from 'express';
import { verifyJWT } from '../middleware/auth';

const router = express.Router();

// Public endpoint
router.get('/public-endpoint', (req, res) => {
  // Implementation
});

// Protected endpoint
router.post('/protected-endpoint', verifyJWT, (req, res) => {
  // Implementation
});

export default router;
```

2. Register the route in `src/app.ts`:

```typescript
import newRoutes from './routes/new-routes';

// Existing code

app.use('/api/new-feature', newRoutes);
```

### Implementing Middleware

To create a new middleware:

1. Create a new file in `src/middleware/`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function customMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Middleware logic
  
  if (/* condition */) {
    return res.status(400).json({ error: 'Error message' });
  }
  
  // If everything is okay, proceed to the next middleware/route handler
  next();
}
```

2. Use the middleware in your routes:

```typescript
import { customMiddleware } from '../middleware/custom-middleware';

router.post('/endpoint', customMiddleware, (req, res) => {
  // Route handler
});
```

## Web Frontend Development

### Component Structure

We follow the Atomic Design methodology for organizing components:

```
src/
├── components/
│   ├── atoms/        # Basic building blocks (buttons, inputs, etc.)
│   ├── molecules/    # Combinations of atoms (form fields, cards, etc.)
│   ├── organisms/    # Complex UI sections (forms, tables, etc.)
│   ├── templates/    # Page layouts
│   └── pages/        # Complete pages
```

### Adding a New Page

To add a new page:

1. Create a new component in `src/components/pages/`:

```typescript
import React from 'react';
import { PageTemplate } from '../templates/PageTemplate';

export function NewPage(): React.ReactElement {
  return (
    <PageTemplate>
      {/* Page content */}
    </PageTemplate>
  );
}
```

2. Add a route in `src/App.tsx`:

```typescript
import { NewPage } from './components/pages/NewPage';

// Inside the Routes component
<Route path="/new-page" element={<NewPage />} />
```

### State Management

We use React Query for server state and Context API for application state:

```typescript
// src/context/AppContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <AppContext.Provider value={{ theme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

### API Integration

We use React Query for API integration:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';

// Fetch data
export function useElections() {
  return useQuery({
    queryKey: ['elections'],
    queryFn: () => api.get('/elections').then(res => res.data)
  });
}

// Mutate data
export function useCreateElection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (election) => api.post('/elections', election).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['elections'] });
    }
  });
}
```

## Mobile Frontend Development

### Navigation Structure

We use React Navigation for managing navigation:

```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="HomeTab" component={HomeStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### Adding a New Screen

To add a new screen:

1. Create a new component in `src/screens/`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type Props = {
  navigation: StackNavigationProp<any>;
};

export function NewScreen({ navigation }: Props): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text>New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

2. Add the screen to the appropriate navigator:

```typescript
<Stack.Screen name="NewScreen" component={NewScreen} />
```

### Native Features

To use native features like the camera:

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export function CameraScreen(): React.ReactElement {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      console.log(photo);
    }
  };
  
  if (hasPermission === null) {
    return <View />;
  }
  
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  
  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        ref={(ref) => setCamera(ref)}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={takePicture}
          >
            <Text style={styles.text}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: 'black',
  },
});
```

## Debugging

### Backend Debugging

To debug the backend:

1. Start the server in debug mode:
   ```bash
   cd backend-api
   npm run debug
   ```

2. Attach a debugger (e.g., VS Code debugger)

3. Set breakpoints in your code

### Web Frontend Debugging

To debug the web frontend:

1. Use browser developer tools (F12 or Ctrl+Shift+I)
2. Use React Developer Tools browser extension
3. Use the built-in debugging in your IDE

### Mobile Frontend Debugging

To debug the mobile frontend:

1. Use React Native Debugger
2. Use Expo DevTools
3. For iOS, use Safari Developer Tools
4. For Android, use Chrome Developer Tools

## Performance Optimization

### Backend Optimization

- Implement caching for frequently accessed data
- Use pagination for large result sets
- Optimize database queries
- Implement proper indexing
- Use worker threads for CPU-intensive tasks

### Frontend Optimization

- Implement code splitting
- Use React.memo for expensive components
- Optimize re-renders with useMemo and useCallback
- Implement virtualization for long lists
- Optimize images and assets

## Security Best Practices

### General Security

- Keep dependencies up to date
- Implement proper input validation
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Use HTTPS for all communications

### Authentication and Authorization

- Use strong password hashing (bcrypt)
- Implement proper JWT handling
- Use short-lived tokens with refresh mechanism
- Implement proper role-based access control
- Use two-factor authentication for sensitive operations

### Frontend Security

- Sanitize user input
- Protect against XSS attacks
- Implement proper CSRF protection
- Use Content Security Policy
- Avoid storing sensitive data in local storage

## Troubleshooting Common Issues

### Backend Issues

1. **Database connection errors**:
   - Check database credentials
   - Ensure the database server is running
   - Check network connectivity

2. **JWT authentication issues**:
   - Verify the JWT secret is consistent
   - Check token expiration
   - Ensure proper token validation

### Web Frontend Issues

1. **API connection errors**:
   - Check API URL configuration
   - Verify CORS settings
   - Check network connectivity

2. **Rendering issues**:
   - Check for React key warnings
   - Verify component props
   - Check for circular dependencies

### Mobile Frontend Issues

1. **Expo build issues**:
   - Clear Expo cache: `expo r -c`
   - Update Expo SDK
   - Check for native module compatibility

2. **Device-specific issues**:
   - Test on multiple devices
   - Use platform-specific code when necessary
   - Check for device compatibility

## Contributing Guidelines

### Code Contribution Process

1. Pick an issue from the issue tracker or create a new one
2. Discuss the approach in the issue
3. Fork the repository and create a feature branch
4. Implement the feature or fix
5. Write tests
6. Update documentation
7. Submit a pull request
8. Address review comments

### Documentation Contribution

1. Identify documentation gaps
2. Fork the repository
3. Update the documentation
4. Submit a pull request

### Reporting Issues

When reporting issues, please include:

1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details (OS, browser, Node.js version, etc.)
6. Screenshots or error logs if applicable

## Resources

### Official Documentation

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)

### Learning Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Hooks Guide](https://reactjs.org/docs/hooks-intro.html)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Blockchain Basics](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

### Community Support

- [Project Discord Server](#)
- [GitHub Discussions](#)
- [Stack Overflow Tag](#)

/**
 * Tests for AuthContext
 */
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { AuthProvider, useAuth, TOKEN_KEY, TOKEN_EMAIL, TOKEN_ELECTORAL_ID, TOKEN_PORT } from 'src/context/AuthContext';
import { mockSecureStore } from '../fixtures/mockSecureStore';
import { mockAxios } from '../fixtures/mockAxios';

// Wrapper component for testing hooks with context
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockSecureStore.resetStore();
    mockAxios.mockClear();
    mockAxios.defaults.headers.common['Authorization'] = '';
    mockAxios.defaults.headers.common['Cookie'] = '';
  });

  test('should initialize with null values', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.authState).toEqual({
      token: null,
      authenticated: null,
      email: null,
      electoralId: null,
      port: null,
    });
  });

  test('should load token from secure store on initialization', async () => {
    // Setup: Store a token in SecureStore before rendering
    await mockSecureStore.setItemAsync(TOKEN_KEY, 'test-token');
    await mockSecureStore.setItemAsync(TOKEN_EMAIL, 'test@example.com');
    await mockSecureStore.setItemAsync(TOKEN_ELECTORAL_ID, 'test-id');
    await mockSecureStore.setItemAsync(TOKEN_PORT, '3010');

    const { result, rerender } = renderHook(() => useAuth(), { wrapper });
    
    // Force a re-render to ensure useEffect has run
    rerender();
    
    // Wait for the async effect to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(result.current.authState).toEqual({
      token: 'test-token',
      authenticated: true,
      email: 'test@example.com',
      electoralId: 'test-id',
      port: '3010',
    });
    
    expect(mockAxios.defaults.headers.common['Authorization']).toBe('Bearer test-token');
    expect(mockAxios.defaults.headers.common['Cookie']).toBe('jwt=test-token');
  });

  test('should successfully login with valid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.onLogin('valid-id', 'valid-password');
    });
    
    expect(mockAxios.post).toHaveBeenCalledWith('/committee/auth-mobile', {
      electoralId: 'valid-id',
      password: 'valid-password'
    });
    
    expect(result.current.authState).toEqual({
      token: 'mock-access-token',
      authenticated: true,
      email: 'test@example.com',
      electoralId: 'valid-id',
      port: '3010',
    });
    
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'mock-access-token');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_EMAIL, 'test@example.com');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_ELECTORAL_ID, 'valid-id');
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_PORT, '3010');
    
    expect(mockAxios.defaults.headers.common['Authorization']).toBe('Bearer mock-access-token');
    expect(mockAxios.defaults.headers.common['Cookie']).toBe('jwt=mock-access-token');
  });

  test('should handle login failure with invalid credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.onLogin('invalid-id', 'invalid-password');
    });
    
    expect(mockAxios.post).toHaveBeenCalledWith('/committee/auth-mobile', {
      electoralId: 'invalid-id',
      password: 'invalid-password'
    });
    
    expect(loginResult).toEqual({
      error: true,
      msg: expect.any(Object)
    });
    
    expect(result.current.authState).toEqual({
      token: null,
      authenticated: null,
      email: null,
      electoralId: null,
      port: null,
    });
    
    expect(mockSecureStore.setItemAsync).not.toHaveBeenCalledWith(TOKEN_KEY, expect.any(String));
  });

  test('should successfully register with valid data', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const registerData = {
      electoralId: 'new-id',
      password: 'password123',
      name: 'Test User',
      email: 'test@example.com'
    };
    
    let registerResult;
    await act(async () => {
      registerResult = await result.current.onRegister(registerData);
    });
    
    expect(mockAxios.post).toHaveBeenCalledWith('/committee/register-voter', registerData);
    expect(registerResult.status).toBe(201);
  });

  test('should successfully logout', async () => {
    // Setup: First login to set the state
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.onLogin('valid-id', 'valid-password');
    });
    
    // Verify login was successful
    expect(result.current.authState.authenticated).toBe(true);
    
    // Now logout
    await act(async () => {
      await result.current.onLogOut();
    });
    
    expect(result.current.authState).toEqual({
      token: null,
      authenticated: false,
      email: "",
      electoralId: "",
      port: "",
    });
    
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_KEY);
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_EMAIL);
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_ELECTORAL_ID);
    expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(TOKEN_PORT);
    
    expect(mockAxios.defaults.headers.common['Authorization']).toBe('');
    expect(mockAxios.defaults.headers.common['Cookie']).toBe('');
  });

  test('should check if user is logged in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    // Setup: Store a token in SecureStore
    await mockSecureStore.setItemAsync(TOKEN_KEY, 'test-token');
    
    let checkResult;
    await act(async () => {
      checkResult = await result.current.isLoggedIn();
    });
    
    expect(mockAxios.get).toHaveBeenCalledWith('/committee/refresh-token', {
      withCredentials: true
    });
    
    expect(result.current.authState).toEqual({
      token: 'mock-refresh-token',
      authenticated: true,
      email: ""
    });
    
    expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(TOKEN_KEY, 'mock-refresh-token');
    expect(mockAxios.defaults.headers.common['Authorization']).toBe('Bearer mock-refresh-token');
  });

  test('should handle image list state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    const testImageList = {
      'image1': { uri: 'test-uri-1' },
      'image2': { uri: 'test-uri-2' }
    };
    
    await act(async () => {
      result.current.setImageList(testImageList);
    });
    
    expect(result.current.imageList).toEqual(testImageList);
  });
});

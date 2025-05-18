/**
 * Tests for axios API client
 */
import { mockAxios } from '../fixtures/mockAxios';
import axios from 'src/api/axios';

describe('Axios API Client', () => {
  beforeEach(() => {
    mockAxios.mockClear();
    mockAxios.defaults.headers.common['Authorization'] = '';
    mockAxios.defaults.headers.common['Cookie'] = '';
  });

  test('has correct default configuration', () => {
    expect(axios.defaults.headers.common['Authorization']).toBe('');
    expect(axios.defaults.headers.common['Cookie']).toBe('');
  });

  test('can set authorization header', () => {
    const token = 'test-token';
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    expect(axios.defaults.headers.common['Authorization']).toBe('Bearer test-token');
  });

  test('can set cookie header', () => {
    const token = 'test-token';
    axios.defaults.headers.common['Cookie'] = `jwt=${token}`;
    expect(axios.defaults.headers.common['Cookie']).toBe('jwt=test-token');
  });

  test('handles GET requests', async () => {
    mockAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { success: true }
    });

    const response = await axios.get('/test-endpoint');
    
    expect(mockAxios.get).toHaveBeenCalledWith('/test-endpoint');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  test('handles POST requests', async () => {
    mockAxios.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 1, success: true }
    });

    const data = { name: 'Test', value: 123 };
    const response = await axios.post('/test-endpoint', data);
    
    expect(mockAxios.post).toHaveBeenCalledWith('/test-endpoint', data);
    expect(response.status).toBe(201);
    expect(response.data).toEqual({ id: 1, success: true });
  });

  test('handles network errors', async () => {
    mockAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    try {
      await axios.get('/test-endpoint');
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.message).toBe('Network Error');
    }
  });

  test('handles API errors with status codes', async () => {
    mockAxios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { error: 'Bad Request' }
      }
    });

    try {
      await axios.post('/test-endpoint', {});
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toEqual({ error: 'Bad Request' });
    }
  });
});

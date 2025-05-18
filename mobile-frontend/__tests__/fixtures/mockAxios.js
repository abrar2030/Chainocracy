/**
 * Mock implementation for axios
 */

export const mockAxios = {
  defaults: {
    headers: {
      common: {
        'Authorization': '',
        'Cookie': ''
      }
    }
  },
  
  get: jest.fn().mockImplementation((url) => {
    if (url.includes('refresh-token')) {
      return Promise.resolve({
        status: 200,
        data: {
          accessToken: 'mock-refresh-token'
        }
      });
    }
    
    return Promise.resolve({
      status: 200,
      data: {}
    });
  }),
  
  post: jest.fn().mockImplementation((url, data) => {
    if (url.includes('auth-mobile')) {
      if (data.electoralId === 'valid-id' && data.password === 'valid-password') {
        return Promise.resolve({
          status: 200,
          data: {
            accessToken: 'mock-access-token',
            email: 'test@example.com',
            port: '3010'
          }
        });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: {
              msg: 'Invalid credentials'
            }
          }
        });
      }
    }
    
    if (url.includes('register-voter')) {
      if (data.electoralId && data.password) {
        return Promise.resolve({
          status: 201,
          data: {
            msg: 'Registration successful'
          }
        });
      } else {
        return Promise.reject({
          response: {
            status: 400,
            data: {
              msg: 'Missing required fields'
            }
          }
        });
      }
    }
    
    return Promise.resolve({
      status: 200,
      data: {}
    });
  }),
  
  // Reset mock implementation between tests
  mockClear: () => {
    mockAxios.get.mockClear();
    mockAxios.post.mockClear();
  }
};

// Mock implementation for expo-secure-store
const secureStore = {};

export default {
  setItemAsync: jest.fn((key, value) => {
    secureStore[key] = value;
    return Promise.resolve();
  }),
  
  getItemAsync: jest.fn((key) => {
    return Promise.resolve(secureStore[key] || null);
  }),
  
  deleteItemAsync: jest.fn((key) => {
    delete secureStore[key];
    return Promise.resolve();
  }),
  
  // Helper method to reset the store between tests
  __resetStore: () => {
    Object.keys(secureStore).forEach(key => {
      delete secureStore[key];
    });
  }
};

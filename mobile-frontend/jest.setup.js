// Jest setup file
import '@testing-library/jest-native/extend-expect';
import { mockSecureStore } from './__tests__/fixtures/mockSecureStore';
import { mockAxios } from './__tests__/fixtures/mockAxios';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => mockSecureStore);

// Mock axios
jest.mock('src/api/axios', () => mockAxios);

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  return {
    PanGestureHandler: 'PanGestureHandler',
    TapGestureHandler: 'TapGestureHandler',
    ScrollView: 'ScrollView',
    State: {},
  };
});

// Mock expo modules
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
        front: 'front',
      },
    },
  },
}));

jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    Constants: {
      Type: {
        back: 'back',
      },
    },
  },
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {
        id: '1',
      },
    }),
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

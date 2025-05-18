/**
 * Tests for CameraQR component
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CameraQR from 'src/components/CameraQR';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: ({ children, ...props }) => (
    <div data-testid="mock-camera" {...props}>
      {children}
    </div>
  ),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  Constants: {
    Type: {
      back: 'back',
    },
  },
}));

// Mock expo-barcode-scanner
jest.mock('expo-barcode-scanner', () => ({
  BarCodeScanner: {
    Constants: {
      Type: {
        back: 'back',
      },
    },
  },
}));

describe('CameraQR Component', () => {
  const mockOnScanned = jest.fn();

  beforeEach(() => {
    mockOnScanned.mockClear();
  });

  test('renders camera when permission is granted', async () => {
    let component;
    
    await act(async () => {
      component = render(<CameraQR onScanned={mockOnScanned} />);
    });
    
    const { getByTestId } = component;
    expect(getByTestId('mock-camera')).toBeTruthy();
  });

  test('handles barcode scanning', async () => {
    let component;
    
    await act(async () => {
      component = render(<CameraQR onScanned={mockOnScanned} />);
    });
    
    const { getByTestId } = component;
    const camera = getByTestId('mock-camera');
    
    // Simulate barcode scan
    const scanData = {
      type: 'QR',
      data: 'test-qr-data'
    };
    
    act(() => {
      // Call the onBarCodeScanned prop function
      camera.props.onBarCodeScanned(scanData);
    });
    
    expect(mockOnScanned).toHaveBeenCalledWith(scanData);
  });

  test('displays permission denied message when camera permission is not granted', async () => {
    // Mock camera permission denied
    require('expo-camera').requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    
    let component;
    
    await act(async () => {
      component = render(<CameraQR onScanned={mockOnScanned} />);
    });
    
    const { getByText, queryByTestId } = component;
    
    expect(queryByTestId('mock-camera')).toBeNull();
    expect(getByText('Camera permission not granted')).toBeTruthy();
  });
});

/**
 * Comprehensive test suite for the crypto module
 */
const CryptoBlockchain = require('../build/crypto/cryptoBlockchain').default;
const fs = require('fs');
const crypto = require('crypto');

// Mock fs.writeFileSync to avoid actual file writing during tests
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
}));

describe('CryptoBlockchain', () => {
  let cryptoBlockchain;
  const testKey = '0123456789abcdef0123456789abcdef'; // 32 bytes
  const testIV = '0123456789abcdef'; // 16 bytes
  
  beforeEach(() => {
    // Create a new instance with test key and IV
    cryptoBlockchain = new CryptoBlockchain(testKey, testIV);
    jest.clearAllMocks();
  });
  
  describe('Constructor', () => {
    test('should initialize with provided key and IV', () => {
      expect(cryptoBlockchain.KEY).toBe(testKey);
      expect(cryptoBlockchain.IV).toBe(testIV);
    });
    
    test('should use default values when key or IV is not provided', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Test with empty key
      const crypto1 = new CryptoBlockchain('', testIV);
      expect(crypto1.KEY).toBe('0123456789abcdef0123456789abcdef');
      expect(consoleSpy).toHaveBeenCalledWith('Warning: Using default encryption key. This is not secure for production.');
      
      // Test with empty IV
      const crypto2 = new CryptoBlockchain(testKey, '');
      expect(crypto2.IV).toBe('0123456789abcdef');
      expect(consoleSpy).toHaveBeenCalledWith('Warning: Using default encryption IV. This is not secure for production.');
      
      // Test with both empty
      const crypto3 = new CryptoBlockchain('', '');
      expect(crypto3.KEY).toBe('0123456789abcdef0123456789abcdef');
      expect(crypto3.IV).toBe('0123456789abcdef');
      
      consoleSpy.mockRestore();
    });
    
    test('should handle short key and IV by padding', () => {
      const shortKey = 'short';
      const shortIV = 'iv';
      const crypto = new CryptoBlockchain(shortKey, shortIV);
      
      // Test encryption still works with padded values
      const data = 'test data';
      const encrypted = crypto.encryptData(data);
      const decrypted = crypto.decryptData(encrypted);
      
      expect(decrypted).toBe(data);
    });
  });
  
  describe('generateSecret', () => {
    test('should generate a secret key and IV', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const result = cryptoBlockchain.generateSecret();
      
      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('iv');
      expect(result.key).toMatch(/^[0-9a-f]{64}$/); // 32 bytes = 64 hex chars
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/);  // 16 bytes = 32 hex chars
      
      expect(fs.writeFileSync).toHaveBeenCalledWith('secret.key', result.key);
      expect(consoleSpy).toHaveBeenCalledWith("Generated Secret Key:", result.key);
      expect(consoleSpy).toHaveBeenCalledWith("Generated IV:", result.iv);
      expect(consoleSpy).toHaveBeenCalledWith("Secret key saved to secret.key");
      
      consoleSpy.mockRestore();
    });
    
    test('should handle errors during secret generation', () => {
      const mockError = new Error('Mock error');
      jest.spyOn(crypto, 'randomBytes').mockImplementationOnce(() => {
        throw mockError;
      });
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        cryptoBlockchain.generateSecret();
      }).toThrow('Failed to generate secret key and IV');
      
      expect(consoleSpy).toHaveBeenCalledWith('Error generating secret:', mockError);
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('generateIdentifier', () => {
    test('should generate an identifier of specified length', () => {
      const length = 8;
      const identifier = cryptoBlockchain.generateIdentifier(length);
      
      expect(identifier).toHaveLength(length);
      expect(identifier).toMatch(/^[0-9a-f]+$/); // Hex format
    });
    
    test('should use default length if not specified', () => {
      const identifier = cryptoBlockchain.generateIdentifier();
      
      expect(identifier).toHaveLength(8); // Default length
      expect(identifier).toMatch(/^[0-9a-f]+$/);
    });
    
    test('should generate different identifiers on each call', () => {
      const id1 = cryptoBlockchain.generateIdentifier();
      const id2 = cryptoBlockchain.generateIdentifier();
      
      expect(id1).not.toBe(id2);
    });
  });
  
  describe('encryptData and decryptData', () => {
    test('should encrypt and decrypt data correctly', () => {
      const testData = 'This is a test message';
      const encrypted = cryptoBlockchain.encryptData(testData);
      
      expect(encrypted).toHaveProperty('IV');
      expect(encrypted).toHaveProperty('CIPHER_TEXT');
      expect(typeof encrypted.IV).toBe('string');
      expect(typeof encrypted.CIPHER_TEXT).toBe('string');
      
      const decrypted = cryptoBlockchain.decryptData(encrypted);
      expect(decrypted).toBe(testData);
    });
    
    test('should handle empty data', () => {
      const testData = '';
      const encrypted = cryptoBlockchain.encryptData(testData);
      const decrypted = cryptoBlockchain.decryptData(encrypted);
      
      expect(decrypted).toBe(testData);
    });
    
    test('should handle special characters', () => {
      const testData = '!@#$%^&*()_+{}:"<>?[];\',./-=';
      const encrypted = cryptoBlockchain.encryptData(testData);
      const decrypted = cryptoBlockchain.decryptData(encrypted);
      
      expect(decrypted).toBe(testData);
    });
    
    test('should handle long data', () => {
      const testData = 'a'.repeat(1000);
      const encrypted = cryptoBlockchain.encryptData(testData);
      const decrypted = cryptoBlockchain.decryptData(encrypted);
      
      expect(decrypted).toBe(testData);
    });
    
    test('should handle encryption errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(crypto, 'createCipheriv').mockImplementationOnce(() => {
        throw new Error('Mock encryption error');
      });
      
      expect(() => {
        cryptoBlockchain.encryptData('test');
      }).toThrow('Failed to encrypt data');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Encryption error:',
        expect.objectContaining({ message: 'Mock encryption error' })
      );
      
      consoleSpy.mockRestore();
    });
    
    test('should handle decryption errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(crypto, 'createDecipheriv').mockImplementationOnce(() => {
        throw new Error('Mock decryption error');
      });
      
      expect(() => {
        cryptoBlockchain.decryptData({
          IV: 'abcdef0123456789',
          CIPHER_TEXT: '123456789abcdef'
        });
      }).toThrow('Failed to decrypt data');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Decryption error:',
        expect.objectContaining({ message: 'Mock decryption error' })
      );
      
      consoleSpy.mockRestore();
    });
  });
});

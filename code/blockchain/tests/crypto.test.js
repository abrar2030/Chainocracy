/**
 * Comprehensive test suite for the crypto module
 */

jest.mock("node:fs", () => ({
  ...jest.requireActual("node:fs"),
  writeFileSync: jest.fn(),
}));

jest.mock("node:crypto", () => {
  const actual = jest.requireActual("node:crypto");
  return {
    ...actual,
    randomBytes: jest.fn((...args) => actual.randomBytes(...args)),
    createCipheriv: jest.fn((...args) => actual.createCipheriv(...args)),
    createDecipheriv: jest.fn((...args) => actual.createDecipheriv(...args)),
  };
});

const CryptoBlockchain = require("../src/crypto/cryptoBlockchain").default;
const nodeCrypto = require("node:crypto");
const fs = require("node:fs");

describe("CryptoBlockchain", () => {
  let cryptoBlockchain;
  const testKey = "0123456789abcdef0123456789abcdef";
  const testIV = "0123456789abcdef";

  beforeEach(() => {
    cryptoBlockchain = new CryptoBlockchain(testKey, testIV);
    jest.clearAllMocks();
    nodeCrypto.randomBytes.mockImplementation(
      jest.requireActual("node:crypto").randomBytes,
    );
    nodeCrypto.createCipheriv.mockImplementation(
      jest.requireActual("node:crypto").createCipheriv,
    );
    nodeCrypto.createDecipheriv.mockImplementation(
      jest.requireActual("node:crypto").createDecipheriv,
    );
  });

  describe("Constructor", () => {
    test("should initialize with provided key and IV", () => {
      expect(cryptoBlockchain.KEY).toBe(testKey);
      expect(cryptoBlockchain.IV).toBe(testIV);
    });

    test("should fall back to default key when key is empty", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const instance = new CryptoBlockchain("", testIV);
      expect(instance.KEY).toBe("0123456789abcdef0123456789abcdef");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Warning: Using default encryption key. This is not secure for production.",
      );
      consoleSpy.mockRestore();
    });

    test("should fall back to default IV when IV is empty", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const instance = new CryptoBlockchain(testKey, "");
      expect(instance.IV).toBe("0123456789abcdef");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Warning: Using default encryption IV. This is not secure for production.",
      );
      consoleSpy.mockRestore();
    });

    test("should fall back to both defaults when both are empty", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const instance = new CryptoBlockchain("", "");
      expect(instance.KEY).toBe("0123456789abcdef0123456789abcdef");
      expect(instance.IV).toBe("0123456789abcdef");
      consoleSpy.mockRestore();
    });

    test("should fall back to defaults for null/undefined inputs", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const instance = new CryptoBlockchain(null, undefined);
      expect(instance.KEY).toBe("0123456789abcdef0123456789abcdef");
      expect(instance.IV).toBe("0123456789abcdef");
      consoleSpy.mockRestore();
    });

    test("should handle short key/IV by padding (round-trip still works)", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const instance = new CryptoBlockchain("short", "iv");
      const data = "test data";
      expect(instance.decryptData(instance.encryptData(data))).toBe(data);
      consoleSpy.mockRestore();
    });
  });

  describe("generateSecret", () => {
    test("should return key (64 hex chars) and iv (32 hex chars)", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const result = cryptoBlockchain.generateSecret();
      expect(result.key).toMatch(/^[0-9a-f]{64}$/);
      expect(result.iv).toMatch(/^[0-9a-f]{32}$/);
      consoleSpy.mockRestore();
    });

    test("should write the generated key to secret.key", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const result = cryptoBlockchain.generateSecret();
      expect(fs.writeFileSync).toHaveBeenCalledWith("secret.key", result.key);
      consoleSpy.mockRestore();
    });

    test("should log three lines to console", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const result = cryptoBlockchain.generateSecret();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Generated Secret Key:",
        result.key,
      );
      expect(consoleSpy).toHaveBeenCalledWith("Generated IV:", result.iv);
      expect(consoleSpy).toHaveBeenCalledWith("Secret key saved to secret.key");
      consoleSpy.mockRestore();
    });

    test("should throw 'Failed to generate secret key and IV' when randomBytes fails", () => {
      const mockError = new Error("Mock randomBytes error");
      nodeCrypto.randomBytes.mockImplementationOnce(() => {
        throw mockError;
      });
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      expect(() => cryptoBlockchain.generateSecret()).toThrow(
        "Failed to generate secret key and IV",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error generating secret:",
        mockError,
      );
      consoleSpy.mockRestore();
    });

    test("should generate different keys on successive calls", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();
      const r1 = cryptoBlockchain.generateSecret();
      const r2 = cryptoBlockchain.generateSecret();
      expect(r1.key).not.toBe(r2.key);
      consoleSpy.mockRestore();
    });
  });

  describe("generateIdentifier", () => {
    test("should generate a hex identifier of the specified length", () => {
      const id = cryptoBlockchain.generateIdentifier(8);
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[0-9a-f]+$/);
    });

    test("should use default length of 8 when called with no argument", () => {
      const id = cryptoBlockchain.generateIdentifier();
      expect(id).toHaveLength(8);
      expect(id).toMatch(/^[0-9a-f]+$/);
    });

    test("should respect custom lengths", () => {
      [4, 12, 16].forEach((len) => {
        const id = cryptoBlockchain.generateIdentifier(len);
        expect(id).toHaveLength(len);
      });
    });

    test("should generate statistically unique identifiers", () => {
      const ids = new Set(
        Array.from({ length: 20 }, () => cryptoBlockchain.generateIdentifier()),
      );
      expect(ids.size).toBeGreaterThan(1);
    });
  });

  describe("encryptData and decryptData", () => {
    test("should return an object with IV and CIPHER_TEXT", () => {
      const enc = cryptoBlockchain.encryptData("hello");
      expect(enc).toHaveProperty("IV");
      expect(enc).toHaveProperty("CIPHER_TEXT");
      expect(typeof enc.IV).toBe("string");
      expect(typeof enc.CIPHER_TEXT).toBe("string");
    });

    test("should round-trip a normal string correctly", () => {
      const data = "This is a test message";
      expect(
        cryptoBlockchain.decryptData(cryptoBlockchain.encryptData(data)),
      ).toBe(data);
    });

    test("should round-trip an empty string", () => {
      expect(
        cryptoBlockchain.decryptData(cryptoBlockchain.encryptData("")),
      ).toBe("");
    });

    test("should round-trip special characters", () => {
      const data = "!@#$%^&*()_+{}:\"<>?[];',./-=";
      expect(
        cryptoBlockchain.decryptData(cryptoBlockchain.encryptData(data)),
      ).toBe(data);
    });

    test("should round-trip long data (1000 chars)", () => {
      const data = "a".repeat(1000);
      expect(
        cryptoBlockchain.decryptData(cryptoBlockchain.encryptData(data)),
      ).toBe(data);
    });

    test("should round-trip unicode / multi-byte characters", () => {
      const data = "American election café ☕";
      expect(
        cryptoBlockchain.decryptData(cryptoBlockchain.encryptData(data)),
      ).toBe(data);
    });

    test("different plaintexts should produce different ciphertexts", () => {
      const e1 = cryptoBlockchain.encryptData("hello");
      const e2 = cryptoBlockchain.encryptData("world");
      expect(e1.CIPHER_TEXT).not.toBe(e2.CIPHER_TEXT);
    });

    test("encrypting the same plaintext twice should use a fresh IV each time (no static-IV reuse)", () => {
      const e1 = cryptoBlockchain.encryptData("same message");
      const e2 = cryptoBlockchain.encryptData("same message");
      expect(e1.IV).not.toBe(e2.IV);
      expect(e1.CIPHER_TEXT).not.toBe(e2.CIPHER_TEXT);
      // Both should still decrypt correctly with their own recorded IV.
      expect(cryptoBlockchain.decryptData(e1)).toBe("same message");
      expect(cryptoBlockchain.decryptData(e2)).toBe("same message");
    });

    test("should throw 'Failed to encrypt data' when cipher creation throws", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Mock encryption error");
      nodeCrypto.createCipheriv.mockImplementationOnce(() => {
        throw mockError;
      });
      expect(() => cryptoBlockchain.encryptData("test")).toThrow(
        "Failed to encrypt data",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Encryption error:",
        expect.objectContaining({ message: "Mock encryption error" }),
      );
      consoleSpy.mockRestore();
    });

    test("should throw 'Failed to decrypt data' when decipher creation throws", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Mock decryption error");
      nodeCrypto.createDecipheriv.mockImplementationOnce(() => {
        throw mockError;
      });
      const enc = cryptoBlockchain.encryptData("original data");
      expect(() => cryptoBlockchain.decryptData(enc)).toThrow(
        "Failed to decrypt data",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Decryption error:",
        expect.objectContaining({ message: "Mock decryption error" }),
      );
      consoleSpy.mockRestore();
    });

    test("should throw 'Failed to decrypt data' when ciphertext is corrupted", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const enc = cryptoBlockchain.encryptData("some data");
      const corrupted = { IV: enc.IV, CIPHER_TEXT: "deadbeefdeadbeef" };
      expect(() => cryptoBlockchain.decryptData(corrupted)).toThrow(
        "Failed to decrypt data",
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Decryption error:",
        expect.objectContaining({ message: expect.any(String) }),
      );
      consoleSpy.mockRestore();
    });
  });
});

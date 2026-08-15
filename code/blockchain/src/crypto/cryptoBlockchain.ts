import * as crypto from "node:crypto";
import fs from "node:fs";
const DEFAULT_KEY = "0123456789abcdef0123456789abcdef";
const DEFAULT_IV = "0123456789abcdef";

class CryptoBlockchain {
  KEY: string;
  IV: string;
  keyLength: number;
  algorithm = "aes-256-cbc";

  constructor(KEY_VAR: any, IV_VAR: any) {
    this.keyLength = 32;

    if (!KEY_VAR || KEY_VAR === "") {
      console.warn(
        "Warning: Using default encryption key. This is not secure for production.",
      );
      this.KEY = DEFAULT_KEY;
    } else {
      this.KEY = KEY_VAR;
    }

    if (!IV_VAR || IV_VAR === "") {
      console.warn(
        "Warning: Using default encryption IV. This is not secure for production.",
      );
      this.IV = DEFAULT_IV;
    } else {
      this.IV = IV_VAR;
    }
  }

  private stringToBuffer(str: string, length: number): Buffer {
    const buf = Buffer.alloc(length, 0);
    const hexBuf = Buffer.from(str, "hex");
    if (hexBuf.length >= length) {
      hexBuf.copy(buf, 0, 0, length);
      return buf;
    }
    const utf8Buf = Buffer.from(str.padEnd(length, "0"), "utf8");
    utf8Buf.copy(buf, 0, 0, Math.min(utf8Buf.length, length));
    return buf;
  }

  private getKeyBuffer(): Buffer {
    return this.stringToBuffer(this.KEY || DEFAULT_KEY, 32);
  }

  public generateSecret(): { key: string; iv: string } {
    try {
      const SECRET_KEY = crypto.randomBytes(this.keyLength);
      const HEX_KEY = SECRET_KEY.toString("hex");
      const IV = crypto.randomBytes(this.keyLength / 2);
      const HEX_IV = IV.toString("hex");

      fs.writeFileSync("secret.key", HEX_KEY);
      console.log("Generated Secret Key:", HEX_KEY);
      console.log("Generated IV:", HEX_IV);
      console.log("Secret key saved to secret.key");

      return { key: HEX_KEY, iv: HEX_IV };
    } catch (error: unknown) {
      console.error("Error generating secret:", error);
      throw new Error("Failed to generate secret key and IV");
    }
  }

  public generateIdentifier(length: number = 8): string {
    const bytes = crypto.randomBytes(Math.ceil(length / 2) + 1);
    return bytes.toString("hex").slice(0, length);
  }

  public encryptData(data: string) {
    try {
      const keyBuf = this.getKeyBuffer();
      // Use a fresh random IV for every encryption rather than the fixed,
      // constructor-configured IV: reusing a static IV across calls with
      // AES-CBC means identical plaintexts always produce identical
      // ciphertexts, leaking patterns (e.g. which voters chose the same
      // candidate). The IV is returned alongside the ciphertext and
      // decryptData already takes it per-call, so this is a drop-in fix.
      const ivBuf = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, keyBuf, ivBuf);
      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return {
        IV: ivBuf.toString("hex"),
        CIPHER_TEXT: encrypted.toString("hex"),
      };
    } catch (error: unknown) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  public decryptData(encryptedData: any): string {
    try {
      const IV = Buffer.from(encryptedData.IV, "hex");
      const encryptedText = Buffer.from(encryptedData.CIPHER_TEXT, "hex");
      const keyBuf = this.getKeyBuffer();
      const decipher = crypto.createDecipheriv(this.algorithm, keyBuf, IV);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error: unknown) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }
}

export default CryptoBlockchain;

import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes key in hex format
const IV_LENGTH = 16; // AES block size

// Ensure the key is 32 bytes (64 hex characters)
const getValidEncryptionKey = (key: string) => {
  const bufferKey = Buffer.from(key, 'hex');
  if (bufferKey.length !== 32) { // Should be 32 bytes (64 hex characters)
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes.');
  }
  return bufferKey;
};

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH); // 16 bytes IV
    const keyBuffer = getValidEncryptionKey(ENCRYPTION_KEY);
  
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`; // Ensure correct format
  }

  export function decrypt(text: string): string {
    if (!text || !text.includes(':')) {
      throw new Error('Malformed input to decrypt. Expected "iv:encryptedText" format.');
    }
  
    const [iv, encryptedText] = text.split(':');
  
    if (iv.length !== IV_LENGTH * 2) { // IV should be 32 characters (16 bytes in hex)
      throw new Error(`Invalid IV length: ${iv.length}. Expected ${IV_LENGTH * 2}.`);
    }
  
    const keyBuffer = getValidEncryptionKey(ENCRYPTION_KEY);
    const ivBuffer = Buffer.from(iv, 'hex');
  
    try {
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
      const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
  
  

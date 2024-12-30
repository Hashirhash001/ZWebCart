import * as crypto from 'crypto';
import * as fs from 'fs';

// Function to generate a 32-byte AES key
const generateKey = (): string => {
  const key = crypto.randomBytes(32); // 32 bytes for AES-256
  return key.toString('hex'); // Return the key as a hexadecimal string
};

// Generate the key and save it to a .env file or print it to the console
const key = generateKey();
console.log('Generated AES Encryption Key:', key);

// Optionally, write it to a .env file
fs.appendFileSync('.env', `ENCRYPTION_KEY=${key}\n`, 'utf8');
console.log('Key written to .env file');

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto = require("crypto");
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16;
const getValidEncryptionKey = (key) => {
    const bufferKey = Buffer.from(key, 'hex');
    if (bufferKey.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be exactly 32 bytes.');
    }
    return bufferKey;
};
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = getValidEncryptionKey(ENCRYPTION_KEY);
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}
function decrypt(text) {
    if (!text || !text.includes(':')) {
        throw new Error('Malformed input to decrypt. Expected "iv:encryptedText" format.');
    }
    const [iv, encryptedText] = text.split(':');
    if (iv.length !== IV_LENGTH * 2) {
        throw new Error(`Invalid IV length: ${iv.length}. Expected ${IV_LENGTH * 2}.`);
    }
    const keyBuffer = getValidEncryptionKey(ENCRYPTION_KEY);
    const ivBuffer = Buffer.from(iv, 'hex');
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, 'hex')), decipher.final()]);
        return decrypted.toString();
    }
    catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}
//# sourceMappingURL=crypto-utils.js.map
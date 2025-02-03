"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const generateKey = () => {
    const key = crypto.randomBytes(32);
    return key.toString('hex');
};
const key = generateKey();
console.log('Generated AES Encryption Key:', key);
fs.appendFileSync('.env', `ENCRYPTION_KEY=${key}\n`, 'utf8');
console.log('Key written to .env file');
//# sourceMappingURL=generate-key.js.map
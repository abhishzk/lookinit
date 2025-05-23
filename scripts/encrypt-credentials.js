const fs = require('fs');
const crypto = require('crypto');

// Read the service account file
const serviceAccountPath = process.argv[2];
if (!serviceAccountPath) {
  console.error('Please provide the path to your service account JSON file');
  process.exit(1);
}

// Generate a random key
const key = crypto.randomBytes(32).toString('hex');

// Read the service account file
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Convert to string
const serviceAccountStr = JSON.stringify(serviceAccount);

// Encrypt using XOR
function encryptXOR(text, key) {
  const result = Buffer.alloc(text.length);
  
  for (let i = 0; i < text.length; i++) {
    result[i] = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
  }
  
  return result.toString('hex');
}

const encrypted = encryptXOR(serviceAccountStr, key);

console.log('Add these environment variables to Netlify:');
console.log(`FIREBASE_CREDENTIALS_KEY=${key}`);
console.log(`FIREBASE_CREDENTIALS_ENCRYPTED=${encrypted}`);

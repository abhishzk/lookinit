module.exports = {
  onPreBuild: async ({ utils }) => {
    const fs = require('fs');
    const path = require('path');
    
    // Get the decryption key from environment variable
    const decryptionKey = process.env.FIREBASE_CREDENTIALS_KEY;
    
    if (!decryptionKey) {
      utils.build.failBuild('Missing FIREBASE_CREDENTIALS_KEY environment variable');
      return;
    }
    
    try {
      // Read the encrypted credentials
      const encryptedCredentials = process.env.FIREBASE_CREDENTIALS_ENCRYPTED;
      
      if (!encryptedCredentials) {
        utils.build.failBuild('Missing FIREBASE_CREDENTIALS_ENCRYPTED environment variable');
        return;
      }
      
      // Simple XOR decryption (you can use a more sophisticated method if needed)
      const decryptedCredentials = decryptXOR(encryptedCredentials, decryptionKey);
      
      // Parse the credentials
      const serviceAccount = JSON.parse(decryptedCredentials);
      
      // Create the service account file content
      const serviceAccountFileContent = `
// This file is auto-generated during build. Do not edit.
export const serviceAccount = ${JSON.stringify(serviceAccount, null, 2)};
      `.trim();
      
      // Write to the service account file
      const serviceAccountFilePath = path.join(process.cwd(), 'lib', 'firebase-service-account-generated.ts');
      fs.writeFileSync(serviceAccountFilePath, serviceAccountFileContent);
      
      console.log('Firebase service account credentials injected successfully');
    } catch (error) {
      utils.build.failBuild(`Failed to inject Firebase credentials: ${error.message}`);
    }
  }
};

// Simple XOR encryption/decryption function
function decryptXOR(encryptedHex, key) {
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const result = Buffer.alloc(encrypted.length);
  
  for (let i = 0; i < encrypted.length; i++) {
    result[i] = encrypted[i] ^ key.charCodeAt(i % key.length);
  }
  
  return result.toString('utf-8');
}
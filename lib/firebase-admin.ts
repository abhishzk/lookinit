import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Prevent multiple initializations in development due to hot reloading
let adminApp: App;

if (!getApps().length) {
  try {
    // Check if we're using the split key approach
    let privateKey: string;
    
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART1 && process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART2) {
      // Combine the private key parts
      const privateKeyPart1 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART1;
      const privateKeyPart2 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART2;
      privateKey = `${privateKeyPart1}${privateKeyPart2}`;
      console.log("Using split private key approach");
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      // Use the original single private key
      privateKey = process.env.FIREBASE_PRIVATE_KEY;
      console.log("Using original private key approach");
    } else {
      throw new Error("No Firebase private key found in environment variables");
    }
    
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Log key information for debugging (be careful not to log the actual key in production)
    console.log("Private key length:", privateKey.length);
    console.log("Private key starts with:", privateKey.substring(0, 27));
    console.log("Private key ends with:", privateKey.substring(privateKey.length - 25));
    
    // Initialize the app with the credential
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    throw error; // Re-throw to make sure the app doesn't start with invalid Firebase config
  }
} else {
  adminApp = getApps()[0];
  console.log("Using existing Firebase Admin app");
}

const adminDb = getFirestore();
const auth = getAuth();

export { adminDb, auth };

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Prevent multiple initializations in development due to hot reloading
let adminApp: App;

if (!getApps().length) {
  try {
    // Get the private key parts from environment variables
    const privateKeyPart1 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART1 || '';
    const privateKeyPart2 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART2 || '';
    
    // Combine them
    const privateKey = privateKeyPart1 + privateKeyPart2;
    
    // Replace escaped newlines with actual newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    // Initialize the app with the credential
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedPrivateKey,
      }),
    });
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    // In production build, we don't want to crash the entire build
    // So we'll initialize with a dummy app if we're in build mode
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log("Using dummy Firebase app for build process");
      adminApp = initializeApp({
        projectId: 'dummy-project',
      }, 'dummy-app');
    } else {
      throw error;
    }
  }
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore(adminApp);
const auth = getAuth(adminApp);

export { adminDb, auth };

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Check if we're in the build phase
const isBuildPhase = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Prevent multiple initializations
let adminApp: App | undefined;
let adminDb: ReturnType<typeof getFirestore> | undefined;
let adminAuth: ReturnType<typeof getAuth> | undefined;

// Only initialize Firebase Admin if we're not in the build phase
if (!isBuildPhase && !getApps().length) {
  try {
    // Get the project ID and client email
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    
    // Get the private key - either from split parts or a single variable
    let privateKey: string;
    
    if (process.env.FIREBASE_PRIVATE_KEY_PART1 && process.env.FIREBASE_PRIVATE_KEY_PART2) {
      // Combine the two parts of the private key
      privateKey = process.env.FIREBASE_PRIVATE_KEY_PART1 + process.env.FIREBASE_PRIVATE_KEY_PART2;
      console.log("Using split private key approach");
    } else if (process.env.FIREBASE_PRIVATE_KEY) {
      // Use the single private key if available
      privateKey = process.env.FIREBASE_PRIVATE_KEY;
      console.log("Using single private key approach");
    } else {
      throw new Error("No Firebase private key found in environment variables");
    }
    
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Initialize Firebase Admin
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    // Don't throw during build
  }
} else if (getApps().length > 0) {
  adminApp = getApps()[0];
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
}

// Safe getters that handle build phase
export function getAdminDb() {
  if (isBuildPhase) return undefined;
  return adminDb;
}

export function getAdminAuth() {
  if (isBuildPhase) return undefined;
  return adminAuth;
}

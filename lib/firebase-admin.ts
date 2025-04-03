import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Prevent multiple initializations in development due to hot reloading
let adminApp: App;

if (!getApps().length) {
  // Combine the private key parts
  const privateKeyPart1 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART1 || '';
  const privateKeyPart2 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_PART2 || '';
  const privateKey = `${privateKeyPart1}${privateKeyPart2}`.replace(/\\n/g, '\n');
  
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
} else {
  adminApp = getApps()[0];
}

const adminDb = getFirestore();
const auth = getAuth();

export { adminDb, auth };

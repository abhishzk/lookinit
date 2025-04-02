import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

// Check if environment variables are set
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Firebase Admin environment variables are missing. Check your .env.local file.');
  console.error('Required variables: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY');
}

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length && projectId && clientEmail && privateKey) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

// Export the auth and firestore instances
// Use try/catch to prevent errors if initialization failed
let auth: Auth | undefined;
let db: Firestore | undefined;

try {
  auth = getAuth();
  db = getFirestore();
} catch (error) {
  console.error('Error getting Firebase Admin services:', error);
}

export { auth, db };

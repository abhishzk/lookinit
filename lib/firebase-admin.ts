import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth'; // Add this import

let firebaseApp: any = null;

function getFirebasePrivateKey(): string {
  // Check if we have the full key first (for local development)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return process.env.FIREBASE_PRIVATE_KEY;
  }

  // Reconstruct from parts (for Netlify production)
  const parts: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const part = process.env[`FIREBASE_PRIVATE_KEY_PART_${i}`];
    if (part) {
      parts.push(part);
    } else {
      throw new Error(`Missing FIREBASE_PRIVATE_KEY_PART_${i} environment variable`);
    }
  }

  if (parts.length !== 5) {
    throw new Error(`Expected 5 private key parts, got ${parts.length}`);
  }

  const fullKey = parts.join('');
  console.log(`Reconstructed private key length: ${fullKey.length}`);
  
  return fullKey;
}

export async function getAdminApp() {
  if (firebaseApp) return firebaseApp;

  if (getApps().length === 0) {
    try {
      const privateKey = getFirebasePrivateKey();
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        throw new Error('Missing FIREBASE_PROJECT_ID or FIREBASE_CLIENT_EMAIL');
      }

      firebaseApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });

      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      throw error;
    }
  } else {
    firebaseApp = getApps()[0];
  }

  return firebaseApp;
}

export async function getAdminDb() {
  const app = await getAdminApp();
  return getFirestore(app);
}

// Add this missing export
export async function getAdminAuth() {
  const app = await getAdminApp();
  return getAuth(app);
}

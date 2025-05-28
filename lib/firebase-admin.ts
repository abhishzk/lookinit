import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { CONFIG } from './config';

let firebaseApp: any = null;

export async function getAdminApp() {
  if (firebaseApp) return firebaseApp;

  if (getApps().length === 0) {
    try {
      console.log('Initializing Firebase Admin with:');
      console.log('Project ID:', CONFIG.firebase.projectId);
      console.log('Client Email:', CONFIG.firebase.clientEmail);
      console.log('Private Key Length:', CONFIG.firebase.privateKey.length);

      firebaseApp = initializeApp({
        credential: cert({
          projectId: CONFIG.firebase.projectId,
          clientEmail: CONFIG.firebase.clientEmail,
          privateKey: CONFIG.firebase.privateKey.replace(/\\n/g, '\n'),
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

export async function getAdminAuth() {
  const app = await getAdminApp();
  return getAuth(app);
}

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let adminAuth: ReturnType<typeof getAuth> | undefined;
let adminDb: ReturnType<typeof getFirestore> | undefined;

async function getSecretFromSecretManager(secretName: string): Promise<string> {
  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${secretName}/versions/latest`;
    
    const [version] = await client.accessSecretVersion({ name });
    
    if (!version.payload?.data) {
      throw new Error(`Secret ${secretName} not found or has no data`);
    }
    
    return version.payload.data.toString();
  } catch (error) {
    console.error('Error accessing secret:', error);
    throw new Error(`Could not access secret: ${secretName}`);
  }
}

export async function initializeFirebaseAdmin() {
  if (adminAuth && adminDb) {
    return { auth: adminAuth, db: adminDb };
  }

  try {
    // Check if Firebase Admin is already initialized
    if (getApps().length === 0) {
      let serviceAccount;
      
      // Try to get service account from Secret Manager
      try {
        const secretData = await getSecretFromSecretManager('firebase-service-account');
        serviceAccount = JSON.parse(secretData);
      } catch (secretError) {
        console.error('Error getting service account from Secret Manager:', secretError);
        throw new Error('Could not obtain Firebase service account credentials');
      }

      // Initialize Firebase Admin with the service account
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }

    adminAuth = getAuth();
    adminDb = getFirestore();
    
    return { auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw new Error('Could not initialize Firebase Admin');
  }
}

export async function getAdminAuth() {
  const { auth } = await initializeFirebaseAdmin();
  return auth;
}

export async function getAdminDb() {
  const { db } = await initializeFirebaseAdmin();
  return db;
}

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
    
    // If we're in development mode, try to use local environment variables instead
    if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log('Using local Firebase service account from environment variables');
      return process.env.FIREBASE_SERVICE_ACCOUNT;
    }
    
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
      
      try {
        // Try to get service account from environment variable first (for local development)
        if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_SERVICE_ACCOUNT) {
          console.log('Using Firebase service account from environment variable');
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } else {
          // Try to get service account from Secret Manager
          const secretData = await getSecretFromSecretManager('firebase-service-account');
          serviceAccount = JSON.parse(secretData);
        }
      } catch (secretError) {
        console.error('Error getting service account:', secretError);
        
        // Fallback to credential object from environment variables if available
        if (process.env.FIREBASE_PROJECT_ID && 
            process.env.FIREBASE_CLIENT_EMAIL && 
            process.env.FIREBASE_PRIVATE_KEY) {
          console.log('Using Firebase credentials from individual environment variables');
          serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          };
        } else {
          throw new Error('Could not obtain Firebase service account credentials');
        }
      }

      // Initialize Firebase Admin with the service account
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || serviceAccount.projectId,
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

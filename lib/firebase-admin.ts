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
    console.error(`Error accessing secret ${secretName}:`, error);
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
      // Get individual credentials from Secret Manager
      try {
        const projectId = await getSecretFromSecretManager('firebase-project-id');
        const clientEmail = await getSecretFromSecretManager('firebase-client-email');
        const privateKey = await getSecretFromSecretManager('firebase-private-key');
        
        console.log('Successfully retrieved Firebase credentials from Secret Manager');
        
        // Fix the private key formatting - ensure proper newlines
        const formattedPrivateKey = privateKey
          .replace(/\\n/g, '\n')
          .replace(/\n\n/g, '\n')
          .trim();
        
        // Ensure the private key has proper PEM format
        let finalPrivateKey = formattedPrivateKey;
        if (!finalPrivateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
          finalPrivateKey = `-----BEGIN PRIVATE KEY-----\n${finalPrivateKey}\n-----END PRIVATE KEY-----`;
        }
        
        // Initialize Firebase Admin with the individual credentials
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: finalPrivateKey,
          }),
          projectId,
        });
      } catch (secretError) {
        console.error('Error getting Firebase credentials from Secret Manager:', secretError);
        
        // Fallback to environment variables if available (for local development)
        if (process.env.FIREBASE_PROJECT_ID && 
            process.env.FIREBASE_CLIENT_EMAIL && 
            process.env.FIREBASE_PRIVATE_KEY) {
          console.log('Using Firebase credentials from environment variables');
          
          initializeApp({
            credential: cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
          });
        } else {
          throw new Error('Could not obtain Firebase credentials from any source');
        }
      }
    }

    adminAuth = getAuth();
    adminDb = getFirestore();
    
    return { auth: adminAuth, db: adminDb };
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw new Error('Could not initialize Firebase Admin: ' + (error instanceof Error ? error.message : String(error)));
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
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

function isBuildTime(): boolean {
  // Check if we're in Netlify build environment
  return process.env.NETLIFY === 'true' && !process.env.NETLIFY_DEV;
}

export async function initializeFirebaseAdmin() {
  // Skip Firebase initialization during Netlify build
  if (isBuildTime()) {
    console.log('Skipping Firebase initialization during Netlify build');
    // Return mock objects that won't be used during build
    return { 
      auth: null as any, 
      db: null as any 
    };
  }

  if (adminAuth && adminDb) {
    return { auth: adminAuth, db: adminDb };
  }

  try {
    // Check if Firebase Admin is already initialized
    if (getApps().length === 0) {
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
        throw new Error('Could not obtain Firebase credentials from any source');
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
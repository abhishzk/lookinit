import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

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
    if (!adminApp && getApps().length === 0) {
      const isNetlify = process.env.APP_ENVIRONMENT === 'netlify';
      console.log(`Running in ${isNetlify ? 'Netlify' : 'local'} environment`);

      if (isNetlify) {
        // On Netlify, use a simplified approach with just the essential credentials
        if (!process.env.APP_FIREBASE_PROJECT_ID || !process.env.APP_FIREBASE_API_KEY) {
          throw new Error('Missing required Firebase environment variables for Netlify');
        }

        console.log('Initializing Firebase Admin on Netlify with minimal credentials');
        
        // Initialize with just the project ID
        adminApp = initializeApp({
          projectId: process.env.APP_FIREBASE_PROJECT_ID,
        });
      } else {
        // In local development, try to use Secret Manager
        try {
          console.log('Attempting to get Firebase credentials from Secret Manager');
          const projectId = await getSecretFromSecretManager('firebase-project-id');
          const clientEmail = await getSecretFromSecretManager('firebase-client-email');
          const privateKey = await getSecretFromSecretManager('firebase-private-key');
          
          const credentials = {
            projectId,
            clientEmail,
            privateKey,
          };
          
          console.log('Successfully retrieved Firebase credentials from Secret Manager');
          
          // Initialize with full credentials
          adminApp = initializeApp({
            credential: cert(credentials),
            projectId,
          });
        } catch (secretError) {
          console.error('Error getting Firebase credentials from Secret Manager:', secretError);
          
          // Fallback to environment variables if available
          if (process.env.APP_FIREBASE_PROJECT_ID && 
              process.env.APP_FIREBASE_CLIENT_EMAIL && 
              process.env.APP_FIREBASE_PRIVATE_KEY) {
            console.log('Using Firebase credentials from environment variables');
            
            adminApp = initializeApp({
              credential: cert({
                projectId: process.env.APP_FIREBASE_PROJECT_ID,
                clientEmail: process.env.APP_FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines with actual newlines
                privateKey: process.env.APP_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              }),
              projectId: process.env.APP_FIREBASE_PROJECT_ID,
            });
          } else {
            throw new Error('No Firebase credentials available');
          }
        }
      }
      
      console.log('Firebase Admin initialized successfully');
    }

    if (!adminApp) {
      throw new Error('Firebase Admin app not initialized');
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    
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

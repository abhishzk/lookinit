import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Check if we're in the build phase
const isBuildPhase = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Set up Google credentials for accessing Secret Manager
function setupGoogleCredentials() {
  if (isBuildPhase) return;
  
  try {
    // If full JSON is provided as environment variable
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const tmpDir = os.tmpdir();
      const credentialsPath = path.join(tmpDir, 'google-credentials.json');
      
      fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      
      console.log('Google credentials set up from JSON environment variable');
      return;
    }
    
    // If individual fields are provided
    if (process.env.GOOGLE_CREDS_TYPE && process.env.GOOGLE_CREDS_PRIVATE_KEY) {
      const credentials = {
        type: process.env.GOOGLE_CREDS_TYPE,
        project_id: process.env.GOOGLE_CREDS_PROJECT_ID,
        private_key_id: process.env.GOOGLE_CREDS_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_CREDS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CREDS_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CREDS_CLIENT_ID,
        auth_uri: process.env.GOOGLE_CREDS_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.GOOGLE_CREDS_TOKEN_URI || "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: process.env.GOOGLE_CREDS_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CREDS_CLIENT_X509_CERT_URL
      };
      
      const tmpDir = os.tmpdir();
      const credentialsPath = path.join(tmpDir, 'google-credentials.json');
      
      fs.writeFileSync(credentialsPath, JSON.stringify(credentials));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      
      console.log('Google credentials set up from individual environment variables');
    }
  } catch (error) {
    console.error('Error setting up Google credentials:', error);
  }
}

// Prevent multiple initializations
let adminApp: App | undefined;
let adminDb: ReturnType<typeof getFirestore> | undefined;
let adminAuth: ReturnType<typeof getAuth> | undefined;

// Modified function to get Firebase service account with better error handling and fallbacks
async function getFirebaseServiceAccount() {
  // First try: Direct environment variable
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      console.log('Using Firebase service account from environment variable');
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error('Error parsing Firebase service account from environment variable:', error);
      // Continue to next method if this fails
    }
  }
  
  // Second try: Secret Manager
  if (process.env.GOOGLE_CLOUD_PROJECT) {
    try {
      console.log('Attempting to fetch Firebase service account from Secret Manager');
      const client = new SecretManagerServiceClient();
      const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/firebase-service-account/versions/latest`;
      
      const [version] = await client.accessSecretVersion({ name });
      const payload = version.payload?.data?.toString() || '{}';
      
      return JSON.parse(payload);
    } catch (error) {
      console.error('Error fetching Firebase service account from Secret Manager:', error);
      // Continue to next method if this fails
    }
  }
  
  // Third try: Individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      console.log('Using Firebase service account from individual environment variables');
      return {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || undefined,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || undefined
      };
    } catch (error) {
      console.error('Error creating Firebase service account from individual environment variables:', error);
      // Continue to next method if this fails
    }
  }
  
  // If all methods fail, throw an error
  throw new Error('Could not obtain Firebase service account credentials from any source');
}

// Initialize Firebase Admin
async function initializeFirebaseAdmin() {
  if (isBuildPhase || getApps().length > 0) {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
    }
    return;
  }
  
  try {
    // Set up Google credentials first
    setupGoogleCredentials();
    
    // Get the service account using the modified function with fallbacks
    const serviceAccount = await getFirebaseServiceAccount();
    
    // Initialize Firebase Admin with the service account
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
    
    // Last resort: try application default credentials
    try {
      console.log("Attempting to initialize with application default credentials");
      adminApp = initializeApp();
      adminDb = getFirestore(adminApp);
      adminAuth = getAuth(adminApp);
      console.log("Firebase Admin initialized with application default credentials");
    } catch (fallbackError) {
      console.error("Failed to initialize with application default credentials:", fallbackError);
      throw new Error("Could not initialize Firebase Admin with any available method");
    }
  }
}

// Initialize immediately if not in build phase
if (!isBuildPhase && !getApps().length) {
  initializeFirebaseAdmin().catch(console.error);
}

// Safe getters that handle build phase and async initialization
export async function getAdminDb() {
  if (isBuildPhase) return undefined;
  
  if (!adminDb && !getApps().length) {
    await initializeFirebaseAdmin();
  }
  
  return adminDb;
}

export async function getAdminAuth() {
  if (isBuildPhase) return undefined;
  
  if (!adminAuth && !getApps().length) {
    await initializeFirebaseAdmin();
  }
  
  return adminAuth;
}

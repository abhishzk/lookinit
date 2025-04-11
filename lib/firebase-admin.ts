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

// Function to get the Firebase service account from Secret Manager
async function getFirebaseServiceAccountFromSecretManager() {
  try {
    const client = new SecretManagerServiceClient();
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/firebase-service-account/versions/latest`;
    
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString() || '{}';
    
    // Log the first few characters to diagnose the issue
    console.log('Secret payload first 20 chars:', payload.substring(0, 20));
    
    // Try to extract valid JSON if there are extra characters
    let jsonMatch = payload.match(/({.*})/);
    if (jsonMatch && jsonMatch[1]) {
      console.log('Extracted JSON object from payload');
      return JSON.parse(jsonMatch[1]);
    }
    
    // If no JSON object found, try to clean the payload
    // Remove any BOM or extra characters
    const cleanPayload = payload
      .replace(/^\uFEFF/, '')  // Remove BOM if present
      .trim();                 // Remove whitespace
    
    // Try to parse the cleaned payload
    try {
      return JSON.parse(cleanPayload);
    } catch (parseError) {
      console.error('Error parsing cleaned payload:', parseError);
      
      // Last attempt: try to find the first '{' and last '}'
      const startIdx = cleanPayload.indexOf('{');
      const endIdx = cleanPayload.lastIndexOf('}');
      
      if (startIdx >= 0 && endIdx > startIdx) {
        const extractedJson = cleanPayload.substring(startIdx, endIdx + 1);
        console.log('Extracted JSON using indices, length:', extractedJson.length);
        return JSON.parse(extractedJson);
      }
      
      throw parseError;
    }
  } catch (error) {
    console.error('Error fetching Firebase service account from Secret Manager:', error);
    throw error;
  }
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
    let serviceAccount;
    
    // First try to use direct environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        console.log("Using Firebase service account from environment variable");
      } catch (error) {
        console.error("Error parsing Firebase service account JSON:", error);
      }
    }
    
    // If that fails, try Secret Manager
    if (!serviceAccount) {
      try {
        serviceAccount = await getFirebaseServiceAccountFromSecretManager();
        console.log("Using Firebase service account from Secret Manager");
      } catch (error) {
        console.error("Error getting Firebase service account from Secret Manager:", error);
      }
    }
    
    // If we still don't have a service account, try individual credential fields
    if (!serviceAccount && process.env.GOOGLE_CREDS_TYPE && process.env.GOOGLE_CREDS_PRIVATE_KEY) {
      serviceAccount = {
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
      console.log("Using Firebase service account from individual environment variables");
    }
    
    if (!serviceAccount) {
      throw new Error("Could not obtain Firebase service account credentials");
    }
    
    // Initialize Firebase Admin with the service account
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
    
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
    
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
}

// Initialize immediately if not in build phase
if (!isBuildPhase && !getApps().length) {
  initializeFirebaseAdmin().catch(console.error);
}

// Safe getters that handle build phase and async initialization
export async function getAdminDb() {
  if (isBuildPhase) return undefined;
  
  try {
    if (!adminDb && !getApps().length) {
      console.log("Initializing Firebase Admin...");
      await initializeFirebaseAdmin();
    }
    
    if (!adminDb) {
      console.error("Firebase Admin DB is still undefined after initialization");
    }
    
    return adminDb;
  } catch (error) {
    console.error("Error in getAdminDb:", error);
    return undefined;
  }
}

export async function getAdminAuth() {
  if (isBuildPhase) return undefined;
  
  if (!adminAuth && !getApps().length) {
    await initializeFirebaseAdmin();
  }
  
  return adminAuth;
}
async function getFirebaseServiceAccount() {
  try {
    // Attempt to fetch the service account from Secret Manager
    const serviceAccount = await getFirebaseServiceAccountFromSecretManager();
    if (serviceAccount) {
      return serviceAccount;
    }
  } catch (error) {
    console.error('Error fetching service account from Secret Manager:', error);
  }

  // Fallback to environment variables if Secret Manager fails
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    try {
      return JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    } catch (error) {
      console.error('Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:', error);
    }
  }

  // If no valid service account is found, throw an error
  throw new Error('Unable to retrieve Firebase service account credentials.');
}


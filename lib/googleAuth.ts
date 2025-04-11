import { GoogleAuth } from 'google-auth-library';

// Configure authentication for Google Cloud services
export function getGoogleAuth() {
  // In production, this will use the default service account
  // In development, it can use application default credentials or a key file
  return new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
}

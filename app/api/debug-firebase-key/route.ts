import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasGoogleServiceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    hasGoogleCloudProject: !!process.env.GOOGLE_CLOUD_PROJECT,
    firebasePrivateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    // Don't log the actual keys for security
  });
}
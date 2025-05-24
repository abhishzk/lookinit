import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../lib/firebase-admin';

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Testing Firebase Admin initialization...');
    
    // Test Firebase Admin Auth
    const auth = await getAdminAuth();
    if (!auth) {
      throw new Error('Firebase Admin Auth is not initialized');
    }
    
    // Test Firebase Admin Firestore
    const db = await getAdminDb();
    if (!db) {
      throw new Error('Firebase Admin Firestore is not initialized');
    }
    
    // Test a simple Firestore query
    const testCollection = db.collection('test');
    await testCollection.limit(1).get();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin initialized successfully',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error('Firebase Auth test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
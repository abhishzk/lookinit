import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Testing Firebase Admin initialization...');
    
    // Test Auth
    const auth = await getAdminAuth();
    console.log('Firebase Auth initialized successfully');
    
    // Test Firestore
    const db = await getAdminDb();
    console.log('Firebase Firestore initialized successfully');
    
    // Try a simple Firestore operation
    const testCollection = db.collection('test');
    const testDoc = await testCollection.doc('test-doc').get();
    console.log('Firestore read operation successful:', testDoc.exists);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin initialized successfully',
      firestoreTest: testDoc.exists ? 'Document exists' : 'Document does not exist'
    });
  } catch (error) {
    console.error('Firebase Admin test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
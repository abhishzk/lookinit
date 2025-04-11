export const runtime = 'nodejs';
import { getAdminDb } from '../../../lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getAdminDb();
    
    if (!db) {
      return NextResponse.json({ status: 'error', message: 'Firebase Admin not initialized' });
    }
    
    // Try a simple query
    const testDoc = await db.collection('test').doc('test').get();
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Firebase Admin initialized successfully',
      exists: testDoc.exists
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

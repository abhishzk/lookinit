import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '../../../lib/firebase-admin';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Get user's search history
export async function GET(request: NextRequest) {
  try {
    // Get the current user from the client-side auth
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the admin DB
    const db = await getAdminDb();
    if (!db) {
      console.error("Database not available. Check Firebase Admin initialization.");
      
      // In development, return mock data
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ 
          history: [
            { id: 'mock1', query: 'Example search 1', timestamp: Date.now() - 86400000 },
            { id: 'mock2', query: 'Example search 2', timestamp: Date.now() - 43200000 },
            { id: 'mock3', query: 'Example search 3', timestamp: Date.now() }
          ]
        });
      }
      
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Verify the ID token
    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: 'Auth not available' }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get the search history for this user
    const snapshot = await db
      .collection('userSearchHistory')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error getting search history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Save a search to history
export async function POST(request: NextRequest) {
  try {
    // Get the current user from the client-side auth
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const { query, results } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get the admin DB
    const db = await getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Verify the ID token
    const adminAuth = await getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json({ error: 'Auth not available' }, { status: 500 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Save the search history
    await db.collection('userSearchHistory').add({
      userId,
      query,
      results: results || null,
      timestamp: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete a search history item
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user from the client-side auth
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the admin DB and auth
    const db = await getAdminDb();
    const adminAuth = await getAdminAuth();
    
    if (!db || !adminAuth) {
      return NextResponse.json({ error: 'Firebase Admin not available' }, { status: 500 });
    }

    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Get the item ID from the request body
    const { id, clearAll } = await request.json();
    
    if (clearAll) {
      // Clear all search history for the user
      const snapshot = await db
        .collection('userSearchHistory')
        .where('userId', '==', userId)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } else if (id) {
      // Delete a specific search history item
      // First verify the item belongs to this user
      const docRef = db.collection('userSearchHistory').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      
      if (doc.data()?.userId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      await docRef.delete();
    } else {
      return NextResponse.json(
        { error: 'Item ID or clearAll flag is required' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting search history:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

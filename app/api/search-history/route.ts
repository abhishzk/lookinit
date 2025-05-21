import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../lib/firebase-admin';
import { verifyIdToken } from './auth-utils';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Get user's search history
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const user = await verifyIdToken(idToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the Firestore database
    const db = await getAdminDb();
    
    // Query the user's search history
    const historySnapshot = await db
      .collection('searchHistory')
      .where('userId', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error getting search history:', error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
}

// Save a search to history
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const user = await verifyIdToken(idToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { query, results } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Create document data without undefined values
    const documentData: {
      userId: string;
      query: any;
      timestamp: number;
      results?: any;
    } = {
      userId: user.uid,
      query,
      timestamp: Date.now()
    };

    // Only add results if it's defined
    if (results !== undefined) {
      documentData.results = results;
    }

    // Get the Firestore database
    const db = await getAdminDb();
    
    // Add the search to history
    const historyRef = await db.collection('searchHistory').add(documentData);

    return NextResponse.json({ 
      id: historyRef.id,
      success: true 
    });
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json({ error: 'Failed to save search history' }, { status: 500 });
  }
}

// Delete a search history item
export async function DELETE(request: Request) {
  try {
    const auth = await getAdminAuth();
    if (!auth) {
      return NextResponse.json(
        { error: 'Firebase Admin is not initialized' },
        { status: 500 }
      );
    }

    // Get the authorization token from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the item ID from the request body
    const { id, clearAll } = await request.json();
    
    const db = await getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    if (clearAll) {
      // Clear all search history for this specific user
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
      // First verify that this item belongs to the current user
      const docRef = db.collection('userSearchHistory').doc(id);
      const doc = await docRef.get();
      
      if (!doc.exists) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      
      const data = doc.data();
      if (data?.userId !== userId) {
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
      { error: 'Failed to delete search history' },
      { status: 500 }
    );
  }
}
async function getAdminAuth() {
  const db = await getAdminDb();
  // Assuming getAdminDb returns the initialized admin.firestore.Firestore instance,
  // and admin.auth() is available via the same admin SDK import.
  // You may need to adjust the import if your firebase-admin setup is different.
  const admin = await import('firebase-admin');
  if (!admin.apps.length) {
    // Initialize if not already initialized (should be handled in getAdminDb, but for safety)
    admin.initializeApp();
  }
  return admin.auth();
}


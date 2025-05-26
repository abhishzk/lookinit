import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../lib/firebase-admin';
import admin from 'firebase-admin';

// Check if we're in build phase
const isBuildPhase = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Types for better type safety
interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
  results?: any;
}

interface DeleteRequestBody {
  id?: string;
  clearAll?: boolean;
}

interface PostRequestBody {
  query: string;
  results?: any;
}

// Helper function to verify ID token
async function verifyIdToken(idToken: string) {
  if (isBuildPhase) {
    throw new Error('Firebase Admin Auth is not initialized during build phase');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Get user's search history
export async function GET(request: NextRequest) {
  if (isBuildPhase) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1];
    console.log('Extracted token from header');

    // Verify the token and get the user
    const user = await verifyIdToken(idToken);
    if (!user) {
      console.error('Token verification failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('User authenticated:', user.uid);

    // Get the Firestore database
    const db = await getAdminDb();
    if (!db) {
      console.error('Firestore database not initialized');
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // Query the user's search history
    console.log('Querying search history for user:', user.uid);
    const historySnapshot = await db
      .collection('searchHistory')
      .where('userId', '==', user.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const history: SearchHistoryItem[] = historySnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || '',
        query: data.query || '',
        timestamp: data.timestamp || 0,
        ...(data.results && { results: data.results })
      };
    });
    console.log(`Found ${history.length} history items`);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error getting search history:', error);
    return NextResponse.json({ error: 'Failed to fetch search history' }, { status: 500 });
  }
}

// Save a search to history
export async function POST(request: NextRequest) {
  if (isBuildPhase) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

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

    // Parse the request body with error handling
    let requestBody: PostRequestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { query, results } = requestBody;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    // Create document data without undefined values
    const documentData: {
      userId: string;
      query: string;
      timestamp: number;
      results?: any;
    } = {
      userId: user.uid,
      query: query.trim(),
      timestamp: Date.now()
    };

    // Only add results if it's defined
    if (results !== undefined) {
      documentData.results = results;
    }

    // Get the Firestore database
    const db = await getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
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
  if (isBuildPhase) {
    return NextResponse.json({ error: 'Service unavailable during build' }, { status: 503 });
  }

  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token and get the user
    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = decodedToken.uid;
    
    // Parse the request body with error handling
    let requestBody: DeleteRequestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { id, clearAll } = requestBody;
    
    const db = await getAdminDb();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }
    
    if (clearAll) {
      // Clear all search history for this specific user
      const snapshot = await db
        .collection('searchHistory')
        .where('userId', '==', userId)
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } else if (id && typeof id === 'string') {
      // Delete a specific search history item
      const docRef = db.collection('searchHistory').doc(id);
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
        { error: 'Valid item ID or clearAll flag is required' },
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

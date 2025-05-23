import { NextRequest, NextResponse } from 'next/server';

// Import both implementations
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import * as firebaseAdminNetlify from '@/lib/firebase-admin-netlify';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Get user's search history
export async function GET(request: NextRequest) {
  try {
    // Check if we're on Netlify
    const isNetlify = process.env.APP_ENVIRONMENT === 'netlify';
    
    if (isNetlify) {
      // Use the Netlify implementation
      // Extract the user ID from the request (you'll need to implement this)
      const uid = request.headers.get('x-user-id') || '';
      
      // Get the user's search history using the Netlify functions
      const searchHistory = await firebaseAdminNetlify.getDocument('searchHistory', uid);
      
      return NextResponse.json({ success: true, data: searchHistory });
    } else {
      // Use the regular Firebase Admin SDK implementation
      const db = await getAdminDb();
      const auth = await getAdminAuth();
      
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
      const decodedToken = await auth.verifyIdToken(idToken);
      const user = { uid: decodedToken.uid };
      if (!user) {
        console.error('Token verification failed');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      console.log('User authenticated:', user.uid);

      // Query the user's search history
      console.log('Querying search history for user:', user.uid);
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

      console.log(`Found ${history.length} history items`);

      return NextResponse.json({ history });
    }
  } catch (error) {
    console.error('Error getting search history:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Save a search to history
export async function POST(request: NextRequest) {
  try {
    // Check if we're on Netlify
    const isNetlify = process.env.APP_ENVIRONMENT === 'netlify';
    
    if (isNetlify) {
      // Parse the request body
      const { query, results, userId } = await request.json();
      
      if (!query || !userId) {
        return NextResponse.json({ error: 'Query and userId are required' }, { status: 400 });
      }

      // Create document data
      const documentData = {
        userId,
        query,
        timestamp: Date.now(),
        results: results || null
      };

      // Generate a unique document ID
      const docId = `${userId}_${Date.now()}`;
      
      // Save to Firestore using Netlify function
      const response = await firebaseAdminNetlify.setDocument('searchHistory', docId, documentData);
      
      return NextResponse.json({ 
        id: docId,
        success: true 
      });
    } else {
      // Get the authorization header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Extract the token
      const idToken = authHeader.split('Bearer ')[1];
      
      // Verify the token and get the user
      const auth = await getAdminAuth();
      const decodedToken = await auth.verifyIdToken(idToken);
      const user = { uid: decodedToken.uid };
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
    }
  } catch (error) {
    console.error('Error saving search history:', error);
    return NextResponse.json({ error: 'Failed to save search history' }, { status: 500 });
  }
}

// Delete a search history item
export async function DELETE(request: Request) {
  try {
    // Check if we're on Netlify
    const isNetlify = process.env.APP_ENVIRONMENT === 'netlify';
    
    if (isNetlify) {
      // Parse the request body
      const { id, userId, clearAll } = await request.json();
      
      if (clearAll) {
        // This would require a custom Netlify function to handle batch operations
        // For now, return an error suggesting this isn't supported
        return NextResponse.json({ 
          error: 'Batch delete not supported in this environment' 
        }, { status: 501 });
      } else if (id) {
        // Delete a specific document
        // First verify this is the user's document (you'd need to implement this check)
        // Then delete it
        await firebaseAdminNetlify.deleteDocument('searchHistory', id);
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: 'Item ID or clearAll flag is required' },
          { status: 400 }
        );
      }
    } else {
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
          .collection('searchHistory')
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
          { error: 'Item ID or clearAll flag is required' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error deleting search history:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { 
  saveSearchToHistory, 
  getUserSearchHistory, 
  deleteSearchHistoryItem, 
  clearUserSearchHistory 
} from '@/lib/db';

// Specify Node.js runtime
export const runtime = 'nodejs';

// Check if we're in the build phase
const isBuildPhase = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Get user's search history
export async function GET(request: Request) {
  // Skip during build phase
  if (isBuildPhase) {
    return NextResponse.json({ history: [] });
  }
  
  try {
    const auth = getAdminAuth();
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
    
    // Get the user's search history
    const history = await getUserSearchHistory(userId);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error getting search history:', error);
    return NextResponse.json(
      { error: 'Failed to get search history' },
      { status: 500 }
    );
  }
}

// Save a search to history
export async function POST(request: Request) {
  if (isBuildPhase) {
    return NextResponse.json({ success: true, id: 'build-time-id' });
  }
  
  try {
    const auth = getAdminAuth();
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
    
    // Get the query from the request body
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Save the search to history
    const id = await saveSearchToHistory(userId, query);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error saving search to history:', error);
    return NextResponse.json(
      { error: 'Failed to save search to history' },
      { status: 500 }
    );
  }
}

// Delete a search history item
export async function DELETE(request: Request) {
  if (isBuildPhase) {
    return NextResponse.json({ success: true });
  }
  
  try {
    const auth = getAdminAuth();
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
    
    // Get the item ID from the request body
    const { id, clearAll } = await request.json();
    
    if (clearAll) {
      // Clear all search history for the user
      await clearUserSearchHistory(decodedToken.uid);
    } else if (id) {
      // Delete a specific search history item
      await deleteSearchHistoryItem(id);
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

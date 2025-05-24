import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';

// Define TypeScript interfaces for the history items
interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
  results?: any;
}

interface SearchResults {
  [key: string]: any;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!auth.currentUser) {
      setHistory([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Getting ID token for user:', auth.currentUser.uid);
      const idToken = await auth.currentUser.getIdToken(true); // Force refresh
      
      console.log('Fetching search history...');
      const response = await fetch('/api/search-history', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Search history API error:', response.status, errorData);
        throw new Error(errorData.error || `Failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.history?.length || 0} history items`);
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSearch = async (query: string, results?: SearchResults) => {
    if (!auth.currentUser) {
      console.warn('Cannot save search history: User not logged in');
      return;
    }
    
    try {
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ query, results })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save search history');
      }
      
      // Refresh the history after saving
      fetchHistory();
    } catch (err) {
      console.error('Error saving search:', err);
      throw err;
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!auth.currentUser) {
      console.warn('Cannot delete search history: User not logged in');
      return;
    }
    
    try {
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete search history item');
      }
      
      // Refresh the history after deleting
      fetchHistory();
    } catch (err) {
      console.error('Error deleting history item:', err);
      throw err;
    }
  };

  const clearAllHistory = async () => {
    if (!auth.currentUser) {
      console.warn('Cannot clear search history: User not logged in');
      return;
    }
    
    try {
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/search-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ clearAll: true })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear search history');
      }
      
      // Refresh the history after clearing
      fetchHistory();
    } catch (err) {
      console.error('Error clearing history:', err);
      throw err;
    }
  };

  // Fetch history when the component mounts or when the user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchHistory();
      } else {
        setHistory([]);
      }
    });
    
    return () => unsubscribe();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refreshHistory: fetchHistory,
    saveSearch,
    deleteHistoryItem,
    clearAllHistory
  };
}

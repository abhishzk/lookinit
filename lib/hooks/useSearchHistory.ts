import { useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';

interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: number;
  results?: any;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch search history
  const fetchHistory = useCallback(async () => {
    if (!auth.currentUser) {
      setHistory([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/search-history', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch search history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to save a search query
  const saveSearch = async (query: string, results?: any) => {
    if (!auth.currentUser) return;

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

      // Refresh history after saving
      fetchHistory();
    } catch (err) {
      console.error('Error saving search:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

    // Function to delete a history item
    const deleteHistoryItem = async (id: string) => {
        if (!auth.currentUser) return;
    
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
    
          // Update local state to remove the deleted item
          setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
        } catch (err) {
          console.error('Error deleting history item:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      };
    
      // Function to clear all history
      const clearAllHistory = async () => {
        if (!auth.currentUser) return;
    
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
    
          // Clear the local state
          setHistory([]);
        } catch (err) {
          console.error('Error clearing history:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      };
    
      // Fetch history when the component mounts and when the user changes
      useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
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
        saveSearch,
        refreshHistory: fetchHistory,
        deleteHistoryItem,
        clearAllHistory
      };
    }
    
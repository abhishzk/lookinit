'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { SearchHistoryItem } from '@/lib/db';
import { 
  fetchSearchHistory, 
  deleteSearchItem, 
  clearSearchHistory 
} from '@/lib/search-history-service';
import { Clock, Trash, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
  onClose?: () => void;
}

export function SearchHistory({ onSelectQuery, onClose }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const historyItems = await fetchSearchHistory();
        setHistory(historyItems);
      } catch (error) {
        console.error('Error fetching search history:', error);
        toast({
          title: 'Error',
          description: 'Failed to load search history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // Set up auth state listener to refresh history when user logs in/out
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchHistory();
      } else {
        setHistory([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent click
    
    try {
      await deleteSearchItem(id);
      setHistory(history.filter(item => item.id !== id));
      toast({
        title: 'Deleted',
        description: 'Search history item removed',
      });
    } catch (error) {
      console.error('Error deleting history item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete history item',
        variant: 'destructive',
      });
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
      toast({
        title: 'Cleared',
        description: 'Search history has been cleared',
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear search history',
        variant: 'destructive',
      });
    }
  };

  const handleSelectQuery = (query: string) => {
    onSelectQuery(query);
    if (onClose) onClose();
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Clock size={20} className="mr-2 text-gray-500" />
          <h3 className="text-lg font-medium">Search History</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-2">
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Clock size={20} className="mr-2 text-gray-500" />
          <h3 className="text-lg font-medium">Search History</h3>
        </div>
        <p className="text-gray-500 text-center py-4">No search history found</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock size={20} className="mr-2 text-gray-500" />
          <h3 className="text-lg font-medium">Search History</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClearHistory}
          className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
        >
          <Trash size={16} className="mr-1" />
          Clear All
        </Button>
      </div>
      
      <div className="space-y-2">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleSelectQuery(item.query)}
            className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group"
          >
            <div className="flex-1 truncate">
              <p className="truncate">{item.query}</p>
              <p className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => handleDeleteItem(item.id, e)}
              >
                <Trash size={16} className="text-red-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

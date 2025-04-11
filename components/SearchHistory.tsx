import { useState } from 'react';
import { useSearchHistory } from '../lib/hooks/useSearchHistory';
import { useAuth } from '../lib/hooks/useAuth';
import { IconRefresh, IconTrash } from '@tabler/icons-react';

// Add proper TypeScript interface for props
interface SearchHistoryProps {
  onSelectQuery?: (query: string) => void;
}

// Add interface for history item
interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  // Add other properties as needed
}

export default function SearchHistory({ onSelectQuery }: SearchHistoryProps) {
  const { history, loading, error, refreshHistory, deleteHistoryItem, clearAllHistory } = useSearchHistory();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="mt-4 p-4 bg-gray-100 dark:bg-[#282a2c] rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Please sign in to view your search history
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-white dark:bg-[#282a2c] shadow-lg rounded-lg">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="ml-2">Loading search history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all your search history?')) {
      setIsDeleting(true);
      await clearAllHistory();
      setIsDeleting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setIsDeleting(true);
    await deleteHistoryItem(id);
    setIsDeleting(false);
  };

  

  return (
    <div className="mt-4 bg-white dark:bg-[#282a2c] shadow-lg rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your Search History</h2>
        <div className="flex space-x-2">
          <button 
            onClick={refreshHistory}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
            title="Refresh history"
            disabled={loading || isDeleting}
          >
            <IconRefresh className="w-5 h-5" />
          </button>
          {history.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              title="Clear all history"
              disabled={loading || isDeleting}
            >
              <IconTrash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      
      {history.length === 0 ? (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400">No search history found</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {history.map((item) => (
            <li key={item.id} className="py-3 flex items-center justify-between">
              {/* Add onClick handler to use the query */}
              <div 
                className="cursor-pointer hover:text-blue-500 dark:hover:text-blue-400"
                onClick={() => onSelectQuery && onSelectQuery(item.query)}
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.query}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                title="Delete this item"
                disabled={isDeleting}
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

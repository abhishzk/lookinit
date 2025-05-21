import { useState, useEffect } from 'react';
import { useSearchHistory } from '../lib/hooks/useSearchHistory';
import { useAuth } from '../lib/hooks/useAuth';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { saveSearch } = useSearchHistory();
  const { user } = useAuth();

  // Listen for events to set the search query (from history selection)
  useEffect(() => {
    const handleSetSearchQuery = (event: CustomEvent) => {
      if (event.detail && event.detail.query) {
        setQuery(event.detail.query);
      }
    };

    window.addEventListener('set-search-query', handleSetSearchQuery as EventListener);
    
    return () => {
      window.removeEventListener('set-search-query', handleSetSearchQuery as EventListener);
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    try {
      // Perform your search logic here
      // For example:
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Save the search query to history if user is logged in
      if (user) {
        await saveSearch(query, data.results);
      }
      
      // Handle search results (e.g., update state, display results)
      // ...
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="border p-2 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded ml-2">
        Search
      </button>
    </form>
  );
}

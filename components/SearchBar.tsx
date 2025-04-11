import { useState } from 'react';
import { useSearchHistory } from '../lib/hooks/useSearchHistory';
import { auth } from '../lib/firebase';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { saveSearch } = useSearchHistory();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Perform your search logic here
      // Example: Fetch search results from an API
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      
      // Save the search query to history if user is logged in
      if (auth.currentUser) {
        await saveSearch(query, results);
      }
      
      // Handle the search results (e.g., update state, navigate to results page)
      // ...
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
      <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-2 focus:outline-none dark:bg-[#282a2c] dark:text-white"
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 transition-colors"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  );
}

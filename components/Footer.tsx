'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const handleSearchStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsSearching(customEvent.detail.isSearching);
    };
    
    // Listen for search status changes
    document.addEventListener('searchStatusChanged', handleSearchStatusChange);
    
    return () => {
      document.removeEventListener('searchStatusChanged', handleSearchStatusChange);
    };
  }, []);
  
  return (
    <footer className={`${isSearching ? 'hidden' : 'block'} w-full text-center py-3 border-t dark:border-gray-800 bg-white dark:bg-[#1e2022] text-sm fixed bottom-0 left-0`}>
      <div className="max-w-3xl mx-auto flex justify-center space-x-6">
        <a href="/pro" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Pro</a>
        <a href="/enterprise" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Enterprise</a>
        <a href="/news" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">News</a>
        <a href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blog</a>
      </div>
    </footer>
  );
}

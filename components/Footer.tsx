'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  
  const [isSearching, setIsSearching] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  
  useEffect(() => {
    const handleSearchStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsSearching(customEvent.detail.isSearching);
    };
    
    const handleMessagesChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      setHasMessages(customEvent.detail.hasMessages);
    };
    
    // Listen for search status changes
    document.addEventListener('searchStatusChanged', handleSearchStatusChange);
    document.addEventListener('messagesChanged', handleMessagesChange);
    
    return () => {
      document.removeEventListener('searchStatusChanged', handleSearchStatusChange);
      document.removeEventListener('messagesChanged', handleMessagesChange);
    };
  }, []);
  
  // Hide footer when searching OR when there are messages (after search)
  if (isSearching || hasMessages) {
    return null;
  }
  
  return (
    <footer className="w-full text-center py-3 border-t dark:border-gray-800 bg-white dark:bg-[#1e2022] text-sm fixed bottom-0 left-0 z-[9999]">
      <div className="max-w-3xl mx-auto flex justify-center space-x-6">
        <a href="/pro" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Pro</a>
        <a href="/enterprise" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Enterprise</a>
        <a href="/news" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">News</a>
        <a href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blog</a>
      </div>
    </footer>
  );
}

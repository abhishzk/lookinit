'use client';

import { useState } from 'react';
import SearchHistory from '@/components/SearchHistory';
import { Clock, NotePencil, X, UserCircle } from '@phosphor-icons/react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistoryQuery: (query: string) => void;
}

export function Sidebar({ isOpen, onClose, onSelectHistoryQuery }: SidebarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 dark:bg-[#282a2c] bg-white text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[1000] flex flex-col`}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-10">
          <X size={24} className="text-black dark:text-white hover:bg-gray-300 hover:dark:bg-[#3b3e41] rounded" />
        </button>

        {/* Sidebar Content - Scrollable */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Fixed Navigation Section */}
          <div className="flex-shrink-0 p-5 pb-0">
            <nav className="mt-10">
              <a href="./" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
                <NotePencil size={24} className="text-black dark:text-white hover:bg-gray-300" /> New Chat
              </a>

              {user && (
                <Link href="/account" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
                  <UserCircle size={24} className="text-black dark:text-white hover:bg-gray-300" /> My Account
                </Link>
              )}

              <Link href="/pro" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M172,36H84A48.05,48.05,0,0,0,36,84v88a48.05,48.05,0,0,0,48,48h88a48.05,48.05,0,0,0,48-48V84A48.05,48.05,0,0,0,172,36ZM84,60h88a24,24,0,0,1,24,24v4H60V84A24,24,0,0,1,84,60ZM172,196H84a24,24,0,0,1-24-24V112H196v60A24,24,0,0,1,172,196Z"></path>
                </svg>
                Upgrade to Pro
              </Link>

              {/* Add your new features here */}
              {/* Example: */}
              {/* <Link href="/settings" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
                <SettingsIcon size={24} className="text-black dark:text-white" /> Settings
              </Link> */}
            </nav>
          </div>

          {/* Search History Section - Scrollable */}
          {user && (
            <div className="flex-1 flex flex-col min-h-0 px-5">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 p-2 w-full text-left hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100 flex-shrink-0"
              >
                <Clock size={24} className="text-black dark:text-white" /> Search History
              </button>
              
              {showHistory && (
                <div className="flex-1 min-h-0 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="h-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <SearchHistory onSelectQuery={onSelectHistoryQuery} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom padding to ensure content doesn't get cut off */}
          <div className="flex-shrink-0 h-4"></div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[999]" onClick={onClose} />}
    </>
  );
}

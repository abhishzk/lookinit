'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sidebar as SidebarIcon, GoogleLogo, UserCircle } from '@phosphor-icons/react';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserAvatar } from './UserAvatar';
import { Sidebar } from './Sidebar';

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasMessages, setHasMessages] = useState(false);

  // Use the auth hook instead of managing state locally
  const { user, loading, signInWithGoogle, logout } = useAuth();

  const handleSelectHistoryQuery = (query: string) => {
    window.dispatchEvent(new CustomEvent('set-search-query', {
      detail: { query }
    }));
    setIsSidebarOpen(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Handle error (show toast, etc.)
      console.error('Sign-in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      // Handle error
      console.error('Sign-out failed:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Listen for messages changes
    const handleMessagesChange = (event: CustomEvent) => {
      setHasMessages(event.detail.hasMessages);
    };

    document.addEventListener('messagesChanged', handleMessagesChange as EventListener);
    return () => document.removeEventListener('messagesChanged', handleMessagesChange as EventListener);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only hide header if there are messages
      if (hasMessages) {
        if (currentScrollY < lastScrollY || currentScrollY < 10) {
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        }
      } else {
        setIsVisible(true); // Always show when no messages
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, hasMessages]);

  return (
    <>
      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectHistoryQuery={handleSelectHistoryQuery} 
      />

      {/* Header */}
      <header className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-14 shrink-0 bg-[#f9f9f9] dark:bg-[#1B1C1D] backdrop-blur-xl ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-300 hover:dark:bg-[#282a2c] text-black rounded-md">
          <SidebarIcon size={24} className="text-black dark:text-white" />
        </button>

        {/* Logo Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <a href="https://lookinit.com/" rel="noopener" target="_blank" className="flex items-center">
            <img src="/bg.png" alt="Lookinit Logo" className="h-16 w-auto sm:h-20 lg:h-24 dark:hidden" />
            <img src="/bgw.png" alt="Lookinit Logo White" className="hidden dark:block h-16 w-auto sm:h-20 lg:h-24" />
          </a>
        </div>

        {/* Login/Signup / Profile Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
                  <UserAvatar user={user} size={40} />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="w-48 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 z-[1000] mt-1"
                >
                  <div className="p-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-black dark:text-white">
                        {user.displayName || 'User'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu.Item className="p-2 hover:dark:bg-[#3b3e41] hover:bg-gray-300 rounded-md cursor-pointer">
                    <Link href="/account" className="flex items-center gap-2 text-black dark:text-white w-full">
                      <UserCircle size={18} />
                      My Account
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Item className="p-2 hover:dark:bg-[#3b3e41] hover:bg-gray-300 rounded-md cursor-pointer">
                    <Link href="/pro" className="flex items-center gap-2 text-black dark:text-white w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M172,36H84A48.05,48.05,0,0,0,36,84v88a48.05,48.05,0,0,0,48,48h88a48.05,48.05,0,0,0,48-48V84A48.05,48.05,0,0,0,172,36ZM84,60h88a24,24,0,0,1,24,24v4H60V84A24,24,0,0,1,84,60ZM172,196H84a24,24,0,0,1-24-24V112H196v60A24,24,0,0,1,172,196Z"></path>
                      </svg>
                      Upgrade to Pro
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                  <DropdownMenu.Item
                    onClick={handleSignOut}
                    className="p-2 hover:dark:bg-[#3b3e41] hover:bg-gray-300 rounded-md text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <Button variant="ghost" className="flex items-center gap-1" onClick={handleGoogleSignIn}>
              <GoogleLogo size={18} />
              <span className="hidden sm:inline">Login with Google</span>
              <span className="sm:hidden">Login</span>
            </Button>
          )}
        </div>
      </header>
    </>
  );
}

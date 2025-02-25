'use client';

import { useState, useEffect } from 'react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Sidebar as SidebarIcon, NotePencil, X, PersonSimple, GoogleLogo } from '@phosphor-icons/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      console.log('Google sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.log('Sign-out error:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 dark:bg-[#282a2c] bg-white text-white p-5 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[1000]`}>
        {/* Close Button */}
        <button onClick={toggleSidebar} className="absolute top-4 right-4 text-white ">
          <X size={24} className="text-black dark:text-white hover:bg-gray-300 hover:dark:bg-[#3b3e41]" />
        </button>

        {/* Sidebar Links */}
        <nav className="mt-10">
          <a href="./" className="flex items-center gap-2 p-2 hover:dark:bg-[#3b3e41] rounded-md text-black dark:text-white hover:bg-gray-100">
            <NotePencil size={24} className="text-black dark:text-white hover:bg-gray-300"/> New Chat
          </a>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-[999]" onClick={toggleSidebar} />}

      {/* Header */}
      <header className={`sticky top-0 z-[500] flex items-center justify-between w-full px-4 h-14 shrink-0 bg-[#f9f9f9] dark:bg-[#1B1C1D] backdrop-blur-xl ${isVisible ? 'header-visible' : 'header-hidden'}`}>
        {/* Sidebar Toggle Button */}
        <button onClick={toggleSidebar} className="p-2 hover:bg-gray-300 hover:dark:bg-[#282a2c] text-black rounded-md">
          <SidebarIcon size={24} className="text-black dark:text-white" />
        </button>

        {/* Logo Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <a href="https://lookinit.com/" rel="noopener" target="_blank" className="flex items-center">
            <img src="bg.png" alt="LookInit Logo" className="h-16 w-auto sm:h-20 lg:h-24 dark:hidden" />
            <img src="bgw.png" alt="LookInit Logo White" className="hidden dark:block h-16 w-auto sm:h-20 lg:h-24" />
          </a>
        </div>

        {/* Login/Signup / Profile Dropdown */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={user.photoURL || "/default-avatar.png"} 
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  className="w-48 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-2 z-[1000] mt-1"
                >
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

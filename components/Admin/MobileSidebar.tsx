// src/components/admin/MobileSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileEdit, Settings, Users, X } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';

export function MobileSidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  console.log('MobileSidebar isOpen:', isOpen); // Debugging isOpen state

  // Ensure the component triggering the sidebar calls the `open` function
  // Example: <button onClick={open}>Open Sidebar</button>

  const navItems = [
    {
      href: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard'
    },
    {
      href: '/admin/blog',
      icon: <FileEdit className="h-5 w-5" />,
      label: 'Blog Posts'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={close}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out">
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center p-2 rounded-md ${
                pathname === item.href
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
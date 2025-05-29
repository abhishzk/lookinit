'use client';

import { useTheme } from '@/lib/theme-context';
import { Sun, Moon, Monitor } from '@phosphor-icons/react';
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface ThemeToggleProps {
  variant?: 'icon' | 'button' | 'minimal';
  showLabel?: boolean;
}

export function ThemeToggle({ variant = 'icon', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme, actualTheme } = useTheme();

  const getIcon = () => {
    switch (actualTheme) {
      case 'dark':
        return <Moon size={20} className="text-yellow-500" />;
      case 'light':
        return <Sun size={20} className="text-orange-500" />;
      default:
        return <Monitor size={20} />;
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle theme"
      >
        {getIcon()}
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`
            flex items-center gap-2 p-2 rounded-md transition-colors
            hover:bg-gray-100 dark:hover:bg-gray-800
            ${variant === 'button' ? 'border border-gray-200 dark:border-gray-700' : ''}
          `}
          aria-label="Toggle theme"
        >
          {getIcon()}
          {showLabel && (
            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
              {theme}
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="w-36 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-1 z-[1000] mt-1"
        >
          <DropdownMenu.Item
            onClick={() => setTheme('light')}
            className={`
              flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}
            `}
          >
            <Sun size={16} className="text-orange-500" />
            <span className="text-gray-700 dark:text-gray-300">Light</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => setTheme('dark')}
            className={`
              flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}
            `}
          >
            <Moon size={16} className="text-yellow-500" />
            <span className="text-gray-700 dark:text-gray-300">Dark</span>
          </DropdownMenu.Item>

          <DropdownMenu.Item
            onClick={() => setTheme('system')}
            className={`
              flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm
              hover:bg-gray-100 dark:hover:bg-gray-700
              ${theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''}
            `}
          >
            <Monitor size={16} className="text-gray-500" />
            <span className="text-gray-700 dark:text-gray-300">System</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
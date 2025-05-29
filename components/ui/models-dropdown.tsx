'use client';

import { useState, useRef, useEffect } from 'react';
import { mentionToolConfig } from '@/app/tools/mentionToolConfig';

interface ModelsDropdownProps {
  selectedMentionTool: string | null;
  selectedMentionToolLogo: string | null;
  onModelSelect: (toolId: string, toolLogo: string, enableRAG: boolean) => void;
  onFocus: () => void;
}

export function ModelsDropdown({ 
  selectedMentionTool, 
  selectedMentionToolLogo, 
  onModelSelect, 
  onFocus 
}: ModelsDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mentionTools = mentionToolConfig.mentionTools;

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  // Calculate dropdown direction
  useEffect(() => {
    const calculateDirection = () => {
      if (dropdownRef.current && showDropdown) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = 240;
        
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          setDropdownDirection('up');
        } else {
          setDropdownDirection('down');
        }
      }
    };

    if (showDropdown) {
      calculateDirection();
      window.addEventListener('resize', calculateDirection);
      window.addEventListener('scroll', calculateDirection);
      
      return () => {
        window.removeEventListener('resize', calculateDirection);
        window.removeEventListener('scroll', calculateDirection);
      };
    }
  }, [showDropdown]);

  const handleModelSelect = (tool: any) => {
    onModelSelect(tool.id, tool.logo, tool.enableRAG);
    setShowDropdown(false);
    onFocus();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors pointer-events-auto"
      >
        {selectedMentionToolLogo ? (
          <img src={selectedMentionToolLogo} className="w-4 h-4 rounded-full" alt="Selected model" />
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <span>Models</span>
        <svg className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <div 
          className={`absolute left-0 w-80 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-[100] pointer-events-auto ${
            dropdownDirection === 'up' 
              ? 'bottom-full mb-1' 
              : 'top-full mt-1'
          }`}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Select AI Model
            </p>
          </div>
          {mentionTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-3 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleModelSelect(tool);
              }}
            >
              {tool.logo ? (
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z"></path>
                  </svg>
                </div>
              )}
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {tool.name}
                </p>
                {tool.enableRAG && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supports file upload
                  </p>
                )}
              </div>
              {selectedMentionTool === tool.id && (
                <div className="ml-2">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
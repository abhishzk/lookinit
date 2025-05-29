'use client';

import { FormEvent, useRef, useState } from 'react';
import Textarea from 'react-textarea-autosize';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ArrowUp, Paperclip } from '@phosphor-icons/react';
import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';
import { ModelsDropdown } from '@/components/ui/models-dropdown';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSubmit: (payload: { message: string; mentionTool: string | null; logo: string | null; file: string }) => void;
  selectedMentionTool: string | null;
  selectedMentionToolLogo: string | null;
  onModelSelect: (toolId: string, toolLogo: string, enableRAG: boolean) => void;
  showRAG: boolean;
  file: string;
  onFileUpload: (file: File) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  setCurrentLlmResponse: (response: string) => void;
  setShowNewsTicker: (show: boolean) => void;
}

export function ChatInput({
  inputValue,
  setInputValue,
  onSubmit,
  selectedMentionTool,
  selectedMentionToolLogo,
  onModelSelect,
  showRAG,
  file,
  onFileUpload,
  isExpanded,
  setIsExpanded,
  setCurrentLlmResponse,
  setShowNewsTicker
}: ChatInputProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setShowNewsTicker(false);
    setIsExpanded(false);
    setCurrentLlmResponse('');
    
    if (window.innerWidth < 600) {
      (e.target as HTMLFormElement)['message']?.blur();
    }

    const payload = {
      message: inputValue.trim(),
      mentionTool: selectedMentionTool,
      logo: selectedMentionToolLogo,
      file: file,
    };
    
    setInputValue('');
    await onSubmit(payload);
  };

  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64File = e.target?.result;
      if (base64File) {
        onFileUpload(file);
      }
    };
    fileReader.readAsDataURL(file);
  };

  const focusTextarea = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <form ref={formRef} onSubmit={handleFormSubmit} className="w-full pointer-events-auto relative">
      <div className={`relative flex flex-col w-full bg-white dark:bg-[#282a2c] border rounded-lg shadow-lg p-4 pointer-events-auto ${isExpanded ? 'h-40' : 'h-24'}`}>
        
        {/* Models Dropdown */}
        <div className="absolute left-3 top-3 z-50">
          <ModelsDropdown
            selectedMentionTool={selectedMentionTool}
            selectedMentionToolLogo={selectedMentionToolLogo}
            onModelSelect={onModelSelect}
            onFocus={focusTextarea}
          />
        </div>

        {/* Textarea */}
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Ask Lookinit or select a model to get started"
          className={`w-full resize-none bg-transparent px-4 py-3 focus:outline-none sm:text-sm dark:text-white text-black ${isExpanded ? 'text-lg pt-12' : 'text-sm pt-10'} ${selectedMentionToolLogo ? 'pl-16' : ''}`}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={isExpanded ? 5 : 1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        {/* File Upload */}
        {showRAG && (
          <>
            <label
              htmlFor="fileInput"
              className="absolute left-12 top-12 w-6 h-6 -rotate-45 transition-transform duration-300 hover:rotate-0 cursor-pointer"
            >
              <Paperclip size={24} />
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".doc,.docx,.pdf, .txt, .js, .tsx"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
          </>
        )}

        <ChatScrollAnchor trackVisibility={false} />
        
        {/* Submit Button */}
        <div className="absolute right-5 bottom-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={inputValue === ''}>
                <ArrowUp />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
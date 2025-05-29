'use client';

import { useState, useEffect, useCallback } from 'react';
import { isSearchLimitReached } from '@/lib/search-counter';
import NewsTicker from './NewsTicker';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useModelSelection } from '@/hooks/use-model-selection';

export default function HomePage() {
  // State
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [file, setFile] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewsTicker, setShowNewsTicker] = useState(true);

  // Custom hooks
  const { user, hasSubscription } = useAuth();
  const { 
    messages, 
    currentLlmResponse, 
    setCurrentLlmResponse, 
    handleUserMessageSubmission 
  } = useChat();
  const {
    selectedMentionTool,
    selectedMentionToolLogo,
    showRAG,
    handleModelSelect,
    clearSelection,
    setShowRAG
  } = useModelSelection();

  // Effects
  useEffect(() => {
    const handleSetSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.query) {
        setInputValue(customEvent.detail.query);
      }
    };

    window.addEventListener('set-search-query', handleSetSearchQuery);
    return () => window.removeEventListener('set-search-query', handleSetSearchQuery);
  }, []);

  useEffect(() => {
    const event = new CustomEvent('messagesChanged', {
      detail: { hasMessages: messages.length > 0 }
    });
    document.dispatchEvent(event);
  }, [messages.length]);

  useEffect(() => {
    if (user && !hasSubscription) {
      const limitReached = isSearchLimitReached(user.uid);
      setSearchLimitReached(limitReached);
    }
  }, [user, hasSubscription]);

  // Handlers
  const handleFollowUpClick = useCallback(async (question: string) => {
    setCurrentLlmResponse('');
    await handleUserMessageSubmission(
      { message: question, mentionTool: null, logo: null, file: file },
      user,
      hasSubscription
    );
  }, [handleUserMessageSubmission, user, hasSubscription, file]);

  const handleSubmit = async (payload: { 
    message: string; 
    mentionTool: string | null; 
    logo: string | null; 
    file: string 
  }) => {
    if (!payload.message) return;
    
    await handleUserMessageSubmission(payload, user, hasSubscription);
    
    // Clear states after submission
    setShowRAG(false);
    clearSelection();
    setFile('');
  };

  const handleFileUpload = (file: File) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64File = e.target?.result;
      if (base64File) {
        setFile(String(base64File));
      }
    };
    fileReader.readAsDataURL(file);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    if (value.trim() === '') {
      clearSelection();
    }
  };

  const handleModelSelectWithRAG = (toolId: string, toolLogo: string, enableRAG: boolean) => {
    handleModelSelect(toolId, toolLogo, enableRAG);
    if (enableRAG) {
      setShowRAG(true);
    }
  };

  return (
    <div>
      <ChatContainer
        messages={messages}
        currentLlmResponse={currentLlmResponse}
        selectedMentionTool={selectedMentionTool}
        handleFollowUpClick={handleFollowUpClick}
      />

      <div className={`px-2 fixed inset-x-0 bottom-0 w-full bg-gradient-to-b duration-300 ease-in-out animate-in dark:from-gray-900/10 dark:from-10% peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]] mb-4 bring-to-front z-40 ${messages.length === 0 ? 'pointer-events-none' : ''}`}>
        <div className="mx-auto max-w-3xl sm:px-4">
          <ChatInput
            inputValue={inputValue}
            setInputValue={handleInputChange}
            onSubmit={handleSubmit}
            selectedMentionTool={selectedMentionTool}
            selectedMentionToolLogo={selectedMentionToolLogo}
            onModelSelect={handleModelSelectWithRAG}
            showRAG={showRAG}
            file={file}
            onFileUpload={handleFileUpload}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            setCurrentLlmResponse={setCurrentLlmResponse}
            setShowNewsTicker={setShowNewsTicker}
          />
        </div>

        {showNewsTicker && (
          <div className="pb-[80px] pt-4 md:pt-10">
            <NewsTicker />
          </div>
        )}
      </div>
    </div>
  );
}

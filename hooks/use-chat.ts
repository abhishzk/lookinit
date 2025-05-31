'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useActions, readStreamableValue } from 'ai/rsc';
import { type AI } from '@/app/action';
import { Message, StreamMessage } from '@/types/chat';
import { auth } from '@/lib/firebase';
import { incrementSearchCount, isSearchLimitReached, SEARCH_LIMIT } from '@/lib/search-counter';
import { useToast } from '@/components/ui/use-toast';
import { User } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Get the Firestore instance using the same app as auth
const getDb = () => {
  try {
    return getFirestore(auth.app);
  } catch (error) {
    console.error('❌ Error getting Firestore instance:', error);
    return null;
  }
};

// Add saveSearch function directly in this file
const saveSearch = async (searchQuery: string): Promise<string | null> => {
  const user = auth.currentUser;
  
  if (!user || !searchQuery?.trim()) {
    console.log('❌ Cannot save search: no user or empty query');
    return null;
  }
  
  const db = getDb();
  if (!db) {
    console.error('❌ Firestore not available');
    return null;
  }
  
  try {
    const historyItem = {
      userId: user.uid,
      query: searchQuery.trim(),
      timestamp: Date.now()
    };
    
    console.log('💾 Saving search to history:', searchQuery);
    const docRef = await addDoc(collection(db, 'searchHistory'), historyItem);
    console.log('✅ Search history saved with ID:', docRef.id);
    return docRef.id;
    
  } catch (error: any) {
    console.error('❌ Error saving search to history:', error);
    
    // Log specific Firebase errors for debugging
    if (error.code) {
      console.error('Firebase error code:', error.code);
      console.error('Firebase error message:', error.message);
    }
    
    return null;
  }
};

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentLlmResponse, setCurrentLlmResponse] = useState('');
  const { myAction } = useActions<typeof AI>();
  const { toast } = useToast();
  
  // Track which messages have already been saved to prevent duplicates
  const savedMessageIds = useRef<Set<number>>(new Set());

  // Save search history when a message is completed
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    
    // Check if we have a completed user message that hasn't been saved yet
    if (latestMessage && 
        latestMessage.type === 'userMessage' &&
        !latestMessage.isStreaming && 
        latestMessage.content && 
        latestMessage.userMessage &&
        !savedMessageIds.current.has(latestMessage.id)) {
      
      console.log('🎯 Detected completed message, saving to history:', latestMessage.userMessage);
      
      // Mark this message as being processed
      savedMessageIds.current.add(latestMessage.id);
      
      // Save to search history
      const saveCompletedSearch = async () => {
        try {
          const searchId = await saveSearch(latestMessage.userMessage);
          if (searchId) {
            console.log('✅ Search saved to history successfully');
          }
        } catch (error) {
          console.error('❌ Failed to save search to history:', error);
          // Remove from saved set if save failed so it can be retried
          savedMessageIds.current.delete(latestMessage.id);
        }
      };
      
      saveCompletedSearch();
    }
  }, [messages]);

  const handleUserMessageSubmission = useCallback(async (
    payload: { message: string; mentionTool: string | null; logo: string | null; file: string },
    user: User | null,
    hasSubscription: boolean
  ) => {
    console.log('🚀 Starting search for:', payload.message);
    console.log('🔍 Environment check:', {
      isDev: process.env.NODE_ENV === 'development',
      hasUser: !!user,
      userUid: user?.uid,
      hasSubscription,
      mentionTool: payload.mentionTool
    });

    // Search limit check
    if (!hasSubscription && isSearchLimitReached(user?.uid)) {
      console.log('🚫 Search limit reached');
      const paymentPromptMessage: Message = {
        id: Date.now(),
        type: 'paymentPrompt',
        userMessage: '',
        content: '',
        images: [],
        videos: [],
        followUp: null,
        isStreaming: false,
        status: 'searchLimitReached',
        isolatedView: false,
        falBase64Image: null,
        logo: undefined,
        semanticCacheKey: null,
        cachedData: '',
        searchResults: [],
        places: [],
        shopping: [],
        ticker: undefined,
        spotify: undefined
      };
      setMessages(prevMessages => [...prevMessages, paymentPromptMessage]);
      return;
    }

    // Increment search count
    if (!hasSubscription && user) {
      const newCount = incrementSearchCount(user?.uid);
      console.log('📊 Search count incremented to:', newCount);
      if (newCount < SEARCH_LIMIT) {
        toast({
          title: `Search ${newCount} of ${SEARCH_LIMIT}`,
          description: `You have ${SEARCH_LIMIT - newCount} free searches remaining.`,
          duration: 3000,
        });
      }
    }

    const newMessageId = Date.now();
    console.log('📝 Creating message with ID:', newMessageId);
    
    const newMessage: Message = {
      id: newMessageId,
      type: 'userMessage',
      userMessage: payload.message,
      content: '',
      images: [],
      videos: [],
      followUp: null,
      isStreaming: true,
      searchResults: [],
      places: [],
      shopping: [],
      status: '',
      ticker: undefined,
      spotify: undefined,
      semanticCacheKey: null,
      cachedData: '',
      isolatedView: !!payload.mentionTool,
      falBase64Image: null,
      logo: payload.logo || undefined,
    };

    setMessages(prevMessages => {
      console.log('📋 Adding message to state, current count:', prevMessages.length);
      return [...prevMessages, newMessage];
    });
    
    let lastAppendedResponse = "";
    
    try {
      console.log('🔄 Calling myAction with:', {
        message: payload.message,
        mentionTool: payload.mentionTool,
        logo: payload.logo,
        file: payload.file
      });
      
      // Add this right after the myAction call to help debug production issues
const streamableValue = await myAction(payload.message, payload.mentionTool, payload.logo, payload.file);
console.log('✅ myAction returned streamableValue:', !!streamableValue);
console.log('🔍 StreamableValue type:', typeof streamableValue);
console.log('🔍 StreamableValue constructor:', streamableValue?.constructor?.name);

      if (!streamableValue) {
        console.error('❌ myAction returned null/undefined streamableValue');
        return;
      }
      
      let llmResponseString = "";
      let messageCount = 0;

      console.log('🔄 Starting to read stream...');
      for await (const message of readStreamableValue(streamableValue)) {
        messageCount++;
        console.log(`📨 Stream message #${messageCount}:`, {
          hasMessage: !!message,
          messageType: typeof message,
          keys: message ? Object.keys(message) : [],
          hasLlmResponse: message && typeof message === 'object' && 'llmResponse' in message,
          hasSearchResults: message && typeof message === 'object' && 'searchResults' in message,
          hasImages: message && typeof message === 'object' && 'images' in message,
          hasVideos: message && typeof message === 'object' && 'videos' in message,
          llmResponseEnd: message && typeof message === 'object' && 'llmResponseEnd' in message ? message.llmResponseEnd : undefined,
          status: message && typeof message === 'object' && 'status' in message ? message.status : undefined
        });
        
        const typedMessage = message as StreamMessage;
        
        setMessages((prevMessages) => {
          const messagesCopy = [...prevMessages];
          const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
          
          if (messageIndex === -1) {
            console.error('❌ Could not find message with ID:', newMessageId);
            return messagesCopy;
          }
          
          const currentMessage = messagesCopy[messageIndex];
          console.log('🔄 Updating message:', {
            messageId: newMessageId,
            currentContentLength: currentMessage.content.length,
            currentSearchResults: currentMessage.searchResults?.length ?? 0,
            currentImages: currentMessage.images?.length ?? 0,
            isStreaming: currentMessage.isStreaming
          });

          if (typedMessage.status === 'rateLimitReached') {
            console.log('🚫 Rate limit reached');
            currentMessage.status = 'rateLimitReached';
          }

          if (typedMessage.isolatedView) {
            currentMessage.isolatedView = true;
          }

          if (typedMessage.llmResponse && typedMessage.llmResponse !== lastAppendedResponse) {
            currentMessage.content += typedMessage.llmResponse;
            lastAppendedResponse = typedMessage.llmResponse;
            console.log('📝 Added LLM response, new length:', currentMessage.content.length);
          }

          if (typedMessage.llmResponseEnd) {
            console.log('🏁 LLM response ended, setting isStreaming to false');
            currentMessage.isStreaming = false;
          }

          if (typedMessage.searchResults) {
            currentMessage.searchResults = typedMessage.searchResults;
            console.log('🔍 Updated search results:', typedMessage.searchResults.length);
          }

          if (typedMessage.images) {
            currentMessage.images = [...typedMessage.images];
            console.log('🖼️ Updated images:', typedMessage.images.length);
          }

          if (typedMessage.videos) {
            currentMessage.videos = [...typedMessage.videos];
            console.log('🎥 Updated videos:', typedMessage.videos.length);
          }

          if (typedMessage.followUp) {
            currentMessage.followUp = typedMessage.followUp;
            console.log('❓ Updated follow-up questions');
          }

          currentMessage.falBase64Image = typedMessage.falBase64Image;

          if (typedMessage.conditionalFunctionCallUI) {
            const functionCall = typedMessage.conditionalFunctionCallUI;
            console.log('🔧 Function call UI:', functionCall.type);
            if (functionCall.type === 'places') currentMessage.places = functionCall.places;
            if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
            if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
            if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
          }

          if (typedMessage.cachedData) {
            console.log('💾 Processing cached data');
            try {
              const data = JSON.parse(typedMessage.cachedData);
              Object.assign(currentMessage, {
                searchResults: data.searchResults,
                images: data.images,
                videos: data.videos,
                content: data.llmResponse,
                isStreaming: false,
                semanticCacheKey: data.semanticCacheKey,
                conditionalFunctionCallUI: data.conditionalFunctionCallUI,
                followUp: data.followUp,
              });

              if (data.conditionalFunctionCallUI) {
                const functionCall = data.conditionalFunctionCallUI;
                if (functionCall.type === 'places') currentMessage.places = functionCall.places;
                if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
                if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
                if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
              }
              console.log('✅ Cached data processed successfully');
            } catch (error) {
              console.error('❌ Error parsing cached data:', error);
            }
          }

          return messagesCopy;

        });        
        if (typedMessage.llmResponse) {
          llmResponseString += typedMessage.llmResponse;
          setCurrentLlmResponse(llmResponseString);
        }
      }
      
      console.log(`✅ Stream completed after ${messageCount} messages`);
      
    } catch (error) {
      console.error("❌ Error during search:", error);
      console.error("Error details:", {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // Update message to show error state
      setMessages((prevMessages) => {
        const messagesCopy = [...prevMessages];
        const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
        if (messageIndex !== -1) {
          messagesCopy[messageIndex].isStreaming = false;
          messagesCopy[messageIndex].content = 'An error occurred while processing your search. Please try again.';
          messagesCopy[messageIndex].status = 'error';
        }
        return messagesCopy;
      });
    }
    
  }, [myAction, toast]);
  const handleFollowUpClick = useCallback(async (question: string, user: User | null, hasSubscription: boolean, file: string) => {
    setCurrentLlmResponse('');
    await handleUserMessageSubmission({ 
      message: question, 
      mentionTool: null, 
      logo: null, 
      file: file 
    }, user, hasSubscription);
  }, [handleUserMessageSubmission]);

  return {
    messages,
    setMessages,
    currentLlmResponse,
    setCurrentLlmResponse,
    handleUserMessageSubmission,
    handleFollowUpClick
  };
}

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
    //console.error('❌ Error getting Firestore instance:', error);
    return null;
  }
};

// Add saveSearch function directly in this file
const saveSearch = async (searchQuery: string): Promise<string | null> => {
  const user = auth.currentUser;
  
  if (!user || !searchQuery?.trim()) {
    //console.log('❌ Cannot save search: no user or empty query');
    return null;
  }
  
  const db = getDb();
  if (!db) {
    //console.error('❌ Firestore not available');
    return null;
  }
  
  try {
    const historyItem = {
      userId: user.uid,
      query: searchQuery.trim(),
      timestamp: Date.now()
    };
    
    //console.log('💾 Saving search to history:', searchQuery);
    const docRef = await addDoc(collection(db, 'searchHistory'), historyItem);
    //console.log('✅ Search history saved with ID:', docRef.id);
    return docRef.id;
    
  } catch (error: any) {
    //console.error('❌ Error saving search to history:', error);
    
    // Log specific Firebase errors for debugging
    if (error.code) {
      //console.error('Firebase error code:', error.code);
      //console.error('Firebase error message:', error.message);
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
      
      //console.log('🎯 Detected completed message, saving to history:', latestMessage.userMessage);
      
      // Mark this message as being processed
      savedMessageIds.current.add(latestMessage.id);
      
      // Save to search history
      const saveCompletedSearch = async () => {
        try {
          const searchId = await saveSearch(latestMessage.userMessage);
          if (searchId) {
            //console.log('✅ Search saved to history successfully');
          }
        } catch (error) {
          //console.error('❌ Failed to save search to history:', error);
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
    //console.log('🚀 Starting search for:', payload.message);

    // Search limit check
    if (!hasSubscription && isSearchLimitReached(user?.uid)) {
      //console.log('🚫 Search limit reached');
      const paymentPromptMessage = {
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
        cachedData: ''
      };
      setMessages(prevMessages => [...prevMessages, { ...paymentPromptMessage }]);
      return;
    }

    // Increment search count
    if (!hasSubscription && user) {
      const newCount = incrementSearchCount(user?.uid);
      if (newCount < SEARCH_LIMIT) {
        toast({
          title: `Search ${newCount} of ${SEARCH_LIMIT}`,
          description: `You have ${SEARCH_LIMIT - newCount} free searches remaining.`,
          duration: 3000,
        });
      }
    }

    const newMessageId = Date.now();
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

    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    let lastAppendedResponse = "";
    
    try {
      const streamableValue = await myAction(payload.message, payload.mentionTool, payload.logo, payload.file);
      let llmResponseString = "";

      for await (const message of readStreamableValue(streamableValue)) {
        const typedMessage = message as StreamMessage;
        
        setMessages((prevMessages) => {
          const messagesCopy = [...prevMessages];
          const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
          
          if (messageIndex !== -1) {
            const currentMessage = messagesCopy[messageIndex];

            if (typedMessage.status === 'rateLimitReached') {
              currentMessage.status = 'rateLimitReached';
            }

            if (typedMessage.isolatedView) {
              currentMessage.isolatedView = true;
            }

            if (typedMessage.llmResponse && typedMessage.llmResponse !== lastAppendedResponse) {
              currentMessage.content += typedMessage.llmResponse;
              lastAppendedResponse = typedMessage.llmResponse;
            }

            if (typedMessage.llmResponseEnd) {
              currentMessage.isStreaming = false;
            }

            currentMessage.searchResults = typedMessage.searchResults || currentMessage.searchResults;
            currentMessage.images = typedMessage.images ? [...typedMessage.images] : currentMessage.images;
            currentMessage.videos = typedMessage.videos ? [...typedMessage.videos] : currentMessage.videos;
            currentMessage.followUp = typedMessage.followUp || currentMessage.followUp;
            currentMessage.falBase64Image = typedMessage.falBase64Image;

            if (typedMessage.conditionalFunctionCallUI) {
              const functionCall = typedMessage.conditionalFunctionCallUI;
              if (functionCall.type === 'places') currentMessage.places = functionCall.places;
              if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
              if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
              if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
            }

            if (typedMessage.cachedData) {
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
            }
          }
          return messagesCopy;
        });
        
        if (typedMessage.llmResponse) {
          llmResponseString += typedMessage.llmResponse;
          setCurrentLlmResponse(llmResponseString);
        }
      }
      
    } catch (error) {
      //console.error("❌ Error during search:", error);
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

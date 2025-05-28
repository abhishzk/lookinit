'use client';
// 1. Import Dependencies
import { FormEvent, useEffect, useRef, useState, useCallback } from 'react';
import { useActions, readStreamableValue } from 'ai/rsc';
import { type AI } from './action';
import { ChatScrollAnchor } from '@/lib/hooks/chat-scroll-anchor';
import Textarea from 'react-textarea-autosize';
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { saveSearchToHistory } from '@/lib/db';

// Add these imports at the top
import { auth } from '@/lib/firebase';
import { getSearchCount, incrementSearchCount, isSearchLimitReached, SEARCH_LIMIT } from '@/lib/search-counter';
import PaymentPrompt from '@/components/answer/PaymentPrompt';
import { useToast } from '@/components/ui/use-toast';

// Main components 
import SearchResultsComponent from '@/components/answer/SearchResultsComponent';
import UserMessageComponent from '@/components/answer/UserMessageComponent';
import FollowUpComponent from '@/components/answer/FollowUpComponent';
import InitialQueries from '@/components/answer/InitialQueries';
// Sidebar components
import LLMResponseComponent from '@/components/answer/LLMResponseComponent';
import ImagesComponent from '@/components/answer/ImagesComponent';
import VideosComponent from '@/components/answer/VideosComponent';
// Function calling components
const MapComponent = dynamic(() => import('@/components/answer/Map'), { ssr: false, });
import MapDetails from '@/components/answer/MapDetails';
import ShoppingComponent from '@/components/answer/ShoppingComponent';
import FinancialChart from '@/components/answer/FinancialChart';
import Spotify from '@/components/answer/Spotify';
import ImageGenerationComponent from '@/components/answer/ImageGenerationComponent';
import { ArrowUp, Paperclip } from '@phosphor-icons/react';
// OPTIONAL: Use Upstash rate limiting to limit the number of requests per user
import RateLimit from '@/components/answer/RateLimit';
import { mentionToolConfig } from './tools/mentionToolConfig';
import NewsTicker from './NewsTicker';
import { User } from 'firebase/auth';
import { AuthProvider } from '@/lib/auth-context';
import { Header } from '@/components/header';

// 2. Set up types
interface SearchResult {
  favicon: string;
  link: string;
  title: string;
}
interface Message {
  falBase64Image: any;
  logo: string | undefined;
  semanticCacheKey: any;
  cachedData: string;
  id: number;
  type: string;
  content: string;
  userMessage: string;
  images: Image[];
  videos: Video[];
  followUp: FollowUp | null;
  isStreaming: boolean;
  searchResults?: SearchResult[];
  conditionalFunctionCallUI?: any;
  status?: string;
  places?: Place[];
  shopping?: Shopping[];
  ticker?: string | undefined;
  spotify?: string | undefined;
  isolatedView: boolean;
}
interface StreamMessage {
  isolatedView: any;
  searchResults?: any;
  userMessage?: string;
  llmResponse?: string;
  llmResponseEnd?: boolean;
  images?: any;
  videos?: any;
  followUp?: any;
  conditionalFunctionCallUI?: any;
  status?: string;
  places?: Place[];
  shopping?: Shopping[];
  ticker?: string;
  spotify?: string;
  cachedData?: string;
  semanticCacheKey?: any;
  falBase64Image?: any;
}
interface Image {
  link: string;
}
interface Video {
  link: string;
  imageUrl: string;
}
interface Place {
  cid: React.Key | null | undefined;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  rating: number;
  category: string;
  phoneNumber?: string;
  website?: string;
}
interface FollowUp {
  choices: {
    message: {
      content: string;
    };
  }[];
}
interface Shopping {
  type: string;
  title: string;
  source: string;
  link: string;
  price: string;
  shopping: any;
  position: number;
  delivery: string;
  imageUrl: string;
  rating: number;
  ratingCount: number;
  offers: string;
  productId: string;
}

const mentionTools = mentionToolConfig.useMentionQueries ? mentionToolConfig.mentionTools : [];

// Add network quality check helper
const checkNetworkQuality = async (): Promise<boolean> => {
  try {
    const start = Date.now();
    await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    const duration = Date.now() - start;
    return duration < 2000; // Good connection if under 2 seconds
  } catch {
    return false;
  }
};

export default function HomePage() {
  // Add this state variable at the top of your Page component
  const [searchLimitReached, setSearchLimitReached] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const { toast } = useToast();
  const [file, setFile] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionTool, setSelectedMentionTool] = useState<string | null>(null);
  const [selectedMentionToolLogo, setSelectedMentionToolLogo] = useState<string | null>(null);
  const [showRAG, setShowRAG] = useState(false);
  const [showNewsTicker, setShowNewsTicker] = useState(true);

  const [isExpanded, setIsExpanded] = useState(true); // State to toggle the size of the Textarea
  // 3. Set up action that will be used to stream all the messages
  const { myAction } = useActions<typeof AI>();
  // 4. Set up form submission handling
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  // 5. Set up state for the messages
  const [messages, setMessages] = useState<Message[]>([]);
  // 6. Set up state for the CURRENT LLM response (for displaying in the UI while streaming)
  const [currentLlmResponse, setCurrentLlmResponse] = useState('');

  // 7. Set up handler for when the user clicks on the follow up button
  const handleFollowUpClick = useCallback(async (question: string) => {
    setCurrentLlmResponse('');
    await handleUserMessageSubmission({ message: question, mentionTool: null, logo: null, file: file });
  }, []);

  // Add connection monitoring
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('connected');
    const handleOffline = () => setConnectionStatus('disconnected');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleSetSearchQuery = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.query) {
        setInputValue(customEvent.detail.query);
        // Optional: auto-submit the query
        // handleSubmit({ message: customEvent.detail.query, mentionTool: null, logo: null, file: '' });
      }
    };

    window.addEventListener('set-search-query', handleSetSearchQuery);

    return () => {
      window.removeEventListener('set-search-query', handleSetSearchQuery);
    };
  }, []);

  // Add this useEffect near the other useEffects in your Page component (around line 200)
  useEffect(() => {
    // Dispatch event when messages change
    const event = new CustomEvent('messagesChanged', {
      detail: { hasMessages: messages.length > 0 }
    });
    document.dispatchEvent(event);
  }, [messages.length]);

  // This useEffect should be at the top level, not nested in another function
  useEffect(() => {
    const checkSubscriptionAndLimit = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Check subscription
        const response = await fetch('/api/stripe/get-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser.uid }),
        });

        if (response.ok) {
          const data = await response.json();
          const isSubscribed = data.subscription?.status === 'active';
          setHasSubscription(isSubscribed);

          // Only check search limit if user doesn't have subscription
          if (!isSubscribed) {
            const limitReached = isSearchLimitReached(currentUser.uid);
            setSearchLimitReached(limitReached);
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          // Check if user has an active subscription
          const response = await fetch('/api/stripe/get-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.uid }),
          });

          if (response.ok) {
            const data = await response.json();
            setHasSubscription(data.subscription?.status === 'active');
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      } else {
        setHasSubscription(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add this function inside your Page component or import it from the service
  const saveSearch = async (query: string) => {
    if (!user) return;

    try {
      // If you're using the client-side service approach
      const token = await user.getIdToken();

      const response = await fetch('/api/search-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }
    } catch (error) {
      console.error('Error saving search to history:', error);
    }
  };

  // 9. Set up handler for when a submission is made, which will call the myAction function
  const handleSubmit = async (payload: { message: string; mentionTool: string | null, logo: string | null, file: string }) => {
    if (!payload.message) return;
    await handleUserMessageSubmission(payload);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    setInputValue('');
    setShowNewsTicker(false); // Hide the news ticker on form submission

    // Add this function inside your Page component
    const handleModelSelection = (toolId: string, toolLogo: string, enableRAG: boolean) => {
      setSelectedMentionTool(toolId);
      setSelectedMentionToolLogo(toolLogo);
      enableRAG && setShowRAG(true);
      setMentionQuery("");
      setInputValue(" "); // Update the input value with a single blank space

      // Focus the textarea and scroll into view
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    const payload = {
      message: inputValue.trim(),
      mentionTool: selectedMentionTool,
      logo: selectedMentionToolLogo,
      file: file,
    };
    await handleSubmit(payload);
    setShowRAG(false);
    setSelectedMentionTool(null);
    setSelectedMentionToolLogo(null);
    setFile('');
  };

  const handleUserMessageSubmission = async (payload: {
    logo: any; message: string; mentionTool: string | null, file: string
  }): Promise<void> => {
    // Check network quality before starting
    const hasGoodConnection = await checkNetworkQuality();
    if (!hasGoodConnection) {
      toast({
        title: "Poor Connection",
        description: "Your connection seems slow. The response may take longer.",
        duration: 5000,
      });
    }

    // Skip search limit check if user has subscription
    if (!hasSubscription && isSearchLimitReached(user?.uid)) {
      setSearchLimitReached(true);
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

    // Only increment search count if user doesn't have subscription
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
    const newMessage = {
      id: newMessageId,
      type: 'userMessage',
      userMessage: payload.message,
      mentionTool: payload.mentionTool,
      file: payload.file,
      logo: payload.logo,
      content: '',
      images: [],
      videos: [],
      followUp: null,
      isStreaming: true,
      searchResults: [] as SearchResult[],
      places: [] as Place[],
      shopping: [] as Shopping[],
      status: '',
      ticker: undefined,
      spotify: undefined,
      semanticCacheKey: null,
      cachedData: '',
      isolatedView: !!payload.mentionTool,
      falBase64Image: null,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);

    let lastAppendedResponse = "";
    let searchCompleted = false;
    let retryCount = 0;
    const maxRetries = 3;

    const executeStream = async (): Promise<void> => {
      // Add connection check before making the call
      if (connectionStatus === 'disconnected') {
        throw new Error('No internet connection');
      }

      setConnectionStatus('connected');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000); // 60 second timeout

      try {
        const streamableValue = await myAction(payload.message, payload.mentionTool, payload.logo, payload.file);

        // Add heartbeat to detect connection issues early
        let lastMessageTime = Date.now();
        const heartbeatInterval = setInterval(() => {
          if (Date.now() - lastMessageTime > 30000) { // 30 seconds without a message
            console.warn('Stream appears stalled, connection may be lost');
            setConnectionStatus('reconnecting');
          }
        }, 5000);

        let llmResponseString = "";
        for await (const message of readStreamableValue(streamableValue)) {
          lastMessageTime = Date.now();
          setConnectionStatus('connected');

          // Clear timeout on successful message
          clearTimeout(timeoutId);

          // Reset timeout for next message
          const newTimeoutId = setTimeout(() => {
            controller.abort();
          }, 30000); // 30 seconds between messages

          const typedMessage = message as StreamMessage;

          // Reset retry count on successful message
          retryCount = 0;

          setMessages((prevMessages) => {
            const messagesCopy = [...prevMessages];
            const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
            if (messageIndex !== -1) {
              const currentMessage = messagesCopy[messageIndex];

              currentMessage.status = typedMessage.status === 'rateLimitReached' ? 'rateLimitReached' : currentMessage.status;

              if (typedMessage.isolatedView) {
                currentMessage.isolatedView = true;
              }

              if (typedMessage.llmResponse && typedMessage.llmResponse !== lastAppendedResponse) {
                currentMessage.content += typedMessage.llmResponse;
                lastAppendedResponse = typedMessage.llmResponse;
              }

              currentMessage.isStreaming = typedMessage.llmResponseEnd ? false : currentMessage.isStreaming;
              currentMessage.searchResults = typedMessage.searchResults || currentMessage.searchResults;
              currentMessage.images = typedMessage.images ? [...typedMessage.images] : currentMessage.images;
              currentMessage.videos = typedMessage.videos ? [...typedMessage.videos] : currentMessage.videos;
              currentMessage.followUp = typedMessage.followUp || currentMessage.followUp;
              currentMessage.semanticCacheKey = messagesCopy[messageIndex];
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
                currentMessage.searchResults = data.searchResults;
                currentMessage.images = data.images;
                currentMessage.videos = data.videos;
                currentMessage.content = data.llmResponse;
                currentMessage.isStreaming = false;
                currentMessage.semanticCacheKey = data.semanticCacheKey;
                currentMessage.conditionalFunctionCallUI = data.conditionalFunctionCallUI;
                currentMessage.followUp = data.followUp;

                if (data.conditionalFunctionCallUI) {
                  const functionCall = data.conditionalFunctionCallUI;
                  if (functionCall.type === 'places') currentMessage.places = functionCall.places;
                  if (functionCall.type === 'shopping') currentMessage.shopping = functionCall.shopping;
                  if (functionCall.type === 'ticker') currentMessage.ticker = functionCall.data;
                  if (functionCall.trackId) currentMessage.spotify = functionCall.trackId;
                }
              }

              // Mark as completed when streaming ends
              if (typedMessage.llmResponseEnd) {
                searchCompleted = true;
                clearTimeout(newTimeoutId);
              }
            }
            return messagesCopy;
          });

          if (typedMessage.llmResponse) {
            llmResponseString += typedMessage.llmResponse;
            setCurrentLlmResponse(llmResponseString);
          }

          if (typedMessage.llmResponseEnd) {
            clearInterval(heartbeatInterval);
            break;
          }
        }

        clearInterval(heartbeatInterval);
        clearTimeout(timeoutId);
        searchCompleted = true;

      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Error streaming data for user message:", error);

        if (error instanceof Error && error.name === 'AbortError') {
          console.error("Stream timeout:", error);
          // Handle timeout specifically
          setMessages((prevMessages) => {
            const messagesCopy = [...prevMessages];
            const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
            if (messageIndex !== -1) {
              messagesCopy[messageIndex].isStreaming = false;
              messagesCopy[messageIndex].content += `\n\n*Request timed out. Please try again.*`;
            }
            return messagesCopy;
          });
          searchCompleted = true;
          return;
        }

        // Check if it's a connection error and we haven't exceeded retry limit
        if (error instanceof Error &&
          (error.message.includes('Connection closed') ||
            error.message.includes('network') ||
            error.message.includes('fetch') ||
            error.message.includes('No internet connection')) &&
          retryCount < maxRetries) {

          retryCount++;
          console.log(`Retrying stream (attempt ${retryCount}/${maxRetries})...`);

          setConnectionStatus('reconnecting');

          // Update UI to show retry
          setMessages((prevMessages) => {
            const messagesCopy = [...prevMessages];
            const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
            if (messageIndex !== -1) {
              messagesCopy[messageIndex].content += `\n\n*Reconnecting... (${retryCount}/${maxRetries})*`;
            }
            return messagesCopy;
          });

          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));

          return executeStream(); // Retry
        }

        // If not a connection error or max retries exceeded, handle gracefully
        if (error instanceof Error &&
          (error.message.includes('Connection closed') ||
            error.message.includes('network') ||
            error.message.includes('fetch'))) {
          setConnectionStatus('disconnected');

          // Auto-retry after a delay
          setTimeout(() => {
            setConnectionStatus('reconnecting');
          }, 2000);
        }

        setMessages((prevMessages) => {
          const messagesCopy = [...prevMessages];
          const messageIndex = messagesCopy.findIndex(msg => msg.id === newMessageId);
          if (messageIndex !== -1) {
            messagesCopy[messageIndex].isStreaming = false;
            if (retryCount >= maxRetries) {
              messagesCopy[messageIndex].content += `\n\n*Connection lost. Please try again.*`;
            } else {
              messagesCopy[messageIndex].content += `\n\n*An error occurred. Please try again.*`;
            }
          }
          return messagesCopy;
        });

        searchCompleted = true;
      }
    };

    try {
      await executeStream();
    } catch (error) {
      console.error("Failed to execute stream:", error);
      searchCompleted = true;
    } finally {
      // Save search to history AFTER the search completes
      if (searchCompleted && user && payload.message.trim()) {
        // Use setTimeout to defer this even further
        setTimeout(async () => {
          try {
            await saveSearch(payload.message);
            console.log('Search saved to history:', payload.message);
          } catch (error) {
            console.error('Error saving search to history:', error);
          }
        }, 100); // Small delay to ensure UI updates first
      }
    }
  };

  const handleFileUpload = (file: File) => {
    console.log('file', file);
    // file reader to read the file and set the file state
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const base64File = e.target?.result;
      if (base64File) {
        console.log('base64File', base64File);
        setFile(String(base64File));
      }
    };
    fileReader.readAsDataURL(file)
  };

  return (
    <div>
      {/* Add connection status indicators */}
      {connectionStatus === 'disconnected' && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          Connection lost. Check your internet.
        </div>
      )}
      {connectionStatus === 'reconnecting' && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg z-50">
          Reconnecting...
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex flex-col pb-32 md:pb-40">
          {messages.map((message, index) => (
            <div key={`message-${index}`}>
              {message.status === 'searchLimitReached' ? (
                <PaymentPrompt />) :
                message.isolatedView ? (
                  selectedMentionTool === 'fal-ai/stable-diffusion-v3-medium'
                    || message.falBase64Image
                    ? (
                      <ImageGenerationComponent key={`image-${index}`} src={message.falBase64Image} query={message.userMessage} />
                    ) : (
                      <LLMResponseComponent
                        key={`llm-response-${index}`}
                        llmResponse={message.content}
                        currentLlmResponse={currentLlmResponse}
                        index={index}
                        semanticCacheKey={message.semanticCacheKey}
                        isolatedView={true}
                        logo={message.logo}
                      />
                    )
                ) : (
                  // Render regular view
                  <div className="flex flex-col md:flex-row max-w-[1200px] mx-auto">
                    <div className="w-full md:w-3/4 md:pr-2">
                      {message.status && message.status === 'rateLimitReached' && <RateLimit />}
                      {message.type === 'userMessage' && <UserMessageComponent message={message.userMessage} />}
                      {message.ticker && message.ticker.length > 0 && (
                        <FinancialChart key={`financialChart-${index}`} ticker={message.ticker} />
                      )}
                      {message.spotify && message.spotify.length > 0 && (
                        <Spotify key={`financialChart-${index}`} spotify={message.spotify} />
                      )}
                      {message.searchResults && (<SearchResultsComponent key={`searchResults-${index}`} searchResults={message.searchResults} />)}
                      {message.places && message.places.length > 0 && (
                        <MapComponent key={`map-${index}`} places={message.places} />
                      )}
                      <LLMResponseComponent llmResponse={message.content} currentLlmResponse={currentLlmResponse} index={index} semanticCacheKey={message.semanticCacheKey} key={`llm-response-${index}`}
                        isolatedView={false}
                      />
                      {message.followUp && (
                        <div className="flex flex-col">
                          <FollowUpComponent key={`followUp-${index}`} followUp={message.followUp} handleFollowUpClick={handleFollowUpClick} />
                        </div>
                      )}
                    </div>
                    <div className="w-full md:w-1/4 md:pl-2">
                      {message.shopping && message.shopping.length > 0 && <ShoppingComponent key={`shopping-${index}`} shopping={message.shopping} />}
                      {message.images && <ImagesComponent key={`images-${index}`} images={message.images} />}
                      {message.videos && <VideosComponent key={`videos-${index}`} videos={message.videos} />}
                      {message.places && message.places.length > 0 && (
                        <MapDetails key={`map-${index}`} places={message.places} />
                      )}
                      {message.falBase64Image && <ImageGenerationComponent key={`image-${index}`} src={message.falBase64Image} />}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}
      <div className={`px-2 fixed inset-x-0 bottom-0 w-full bg-gradient-to-b duration-300 ease-in-out animate-in dark:from-gray-900/10 dark:from-10% peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]] mb-4 bring-to-front z-40 ${messages.length === 0 ? 'pointer-events-none' : ''}`}>
        <div className="mx-auto ${isExpanded ? 'max-w-3xl' : 'max-w-2xl'} max-w-3xl sm:px-4 ">
          {/* {messages.length === 0 && !inputValue && (
            <InitialQueries questions={['What's the most iconic music festival of all time?', 'How has Tesla's stock performed over the last year?', 'What are the top attractions to visit in Dublin, Ireland?', 'Show most underrated travel destination in 2025?']} handleFollowUpClick={handleFollowUpClick} />
          )} */}
          {mentionQuery && (
            <div className="">
              <div className="flex items-center"></div>
              <ul className="max-h-60 overflow-y-auto">
                {mentionTools
                  .filter((tool) =>
                    tool.name.toLowerCase().includes(mentionQuery.toLowerCase())
                  )
                  .map((tool) => (
                    <li
                      key={tool.id}
                      className="flex items-center cursor-pointer dark:bg-[#282a2c] bg-white shadow-lg rounded-lg p-2 mb-1"
                      onClick={() => {
                        setSelectedMentionTool(tool.id);
                        setSelectedMentionToolLogo(tool.logo);
                        tool.enableRAG && setShowRAG(true);
                        setMentionQuery("");
                        setInputValue(" "); // Update the input value with a single blank space
                      }}
                    >
                      {tool.logo ? (
                        <img
                          src={tool.logo}
                          alt={tool.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span
                          role="img"
                          aria-label="link"
                          className="mr-2 dark:text-white text-black"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 256 256"
                            fill="currentColor"
                            className="h-4 w-4"
                          >
                            <path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8Z"></path>
                          </svg>
                        </span>
                      )}
                      <p className="ml-2 dark:text-white block sm:inline text-md sm:text-lg font-semibold dark:text-white text-black">
                        {tool.name}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <form
            ref={formRef}
            onSubmit={async (e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              handleFormSubmit(e);
              setIsExpanded(false); // Shrink the Textarea after submission
              setCurrentLlmResponse('');
              if (window.innerWidth < 600) {
                (e.target as HTMLFormElement)['message']?.blur();
              }
              const value = inputValue.trim();
              setInputValue('');
              if (!value) return;
            }}
            className={`w-full pointer-events-auto '}`} // Adjust width based on state & pointer-events
          >
            <div className={`relative flex flex-col w-full overflow-hidden bg-white dark:bg-[#282a2c] border rounded-lg shadow-lg p-4 pointer-events-auto ${isExpanded ? 'h-40' : 'h-24'}`} // Adjust height based on state
            >
              {selectedMentionToolLogo && (
                <img
                  src={selectedMentionToolLogo}
                  className="absolute left-3 top-4 w-8 h-8 z-10"
                />
              )}
              {showRAG && (
                <>
                  {/* increase size on hover */}
                  <label
                    htmlFor="fileInput"
                    className="absolute left-12 top-5 w-6 h-6 -rotate-45 transition-transform duration-300 hover:rotate-0 "
                  >
                    <Paperclip size={28} />
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
              <Textarea
                ref={inputRef}
                tabIndex={0}
                onKeyDown={onKeyDown}
                placeholder="Ask Lookinit or @ to explore other AI models"
                className={`w-full resize-none bg-transparent px-4 py-3 focus:outline-none sm:text-sm dark:text-white text-black ${isExpanded ? 'text-lg' : 'text-sm'} ${selectedMentionToolLogo ? 'pl-16' : ''}`} // Adjust font size based on state
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                name="message"
                rows={isExpanded ? 5 : 1} // Adjust rows based on state
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(value);

                  if (value.includes('@')) {
                    const mentionIndex = value.lastIndexOf('@');
                    const query = value.slice(mentionIndex + 1);
                    setMentionQuery(query);
                  } else {
                    setMentionQuery('');
                  }

                  if (value.trim() === '') {
                    setSelectedMentionTool(null);
                    setSelectedMentionToolLogo(null);
                    setShowRAG(false);
                  }
                }}
              />
              <ChatScrollAnchor trackVisibility={false} />
              <div className="absolute right-5 bottom-5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="submit" size="icon" disabled={inputValue === '' || connectionStatus === 'disconnected'}>
                      <ArrowUp />
                      <span className="sr-only">Send message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {connectionStatus === 'disconnected' ? 'No connection' : 'Send message'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </form>
        </div>
        {showNewsTicker && (
          <div className="pb-[80px] pt-4 md:pt-10">
            <NewsTicker />
          </div>
        )}
        {/* Footer with monetization links
        <div className="w-full text-center py-3 border-t dark:border-gray-800 bg-white dark:bg-[#1e2022] text-sm">
          <div className="max-w-3xl mx-auto flex justify-center space-x-6">
            <a href="/pro" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Pro</a>
            <a href="/enterprise" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Enterprise</a>
            <a href="/news" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">News</a>
            <a href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blog</a>
          </div>
        </div> */}
      </div>
    </div>
  );
};
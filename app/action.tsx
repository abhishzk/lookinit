"use server";

import { createAI, createStreamableValue } from 'ai/rsc';
import { config } from './config';
import { functionCalling } from './function-calling';
import { getSearchResults, getImages, getVideos } from './tools/searchProviders';
import { get10BlueLinksContents, processAndVectorizeContent } from './tools/contentProcessing';
import { setInSemanticCache, clearSemanticCache, initializeSemanticCache, getFromSemanticCache } from './tools/semanticCache';
import { relevantQuestions } from './tools/generateRelevantQuestions';
import { streamingChatCompletion } from './tools/streamingChatCompletion';
import { checkRateLimit } from './tools/rateLimiting';
import { lookupTool } from './tools/mentionTools';

async function myAction(userMessage: string, mentionTool: string | null, logo: string | null, file: string): Promise<any> {
  "use server";
  console.log('🚀 myAction called with:', { userMessage, mentionTool, logo, file });
  
  const streamable = createStreamableValue({});

  (async () => {
    try {
      console.log('🔄 Starting action processing...');
      
      // Rate limit check
      console.log('🔄 Checking rate limit...');
      await checkRateLimit(streamable);
      console.log('✅ Rate limit check passed');

      // Initialize semantic cache
      console.log('🔄 Initializing semantic cache...');
      await initializeSemanticCache();
      console.log('✅ Semantic cache initialized');

      // Check for cached data
      console.log('🔄 Checking for cached data...');
      const cachedData = await getFromSemanticCache(userMessage);
      if (cachedData) {
        console.log('💾 Found cached data, returning early');
        streamable.update({ cachedData });
        streamable.done({ llmResponseEnd: true });
        return;
      }
      console.log('✅ No cached data found, proceeding with fresh search');

      if (mentionTool) {
        console.log('🔧 Processing mention tool:', mentionTool);
        await lookupTool(mentionTool, userMessage, streamable, file);
        streamable.done({ llmResponseEnd: true });
      } else {
        console.log('🔍 Processing regular search...');
        
        // Parallel fetch of search data with individual error handling
        console.log('🔄 Fetching search data in parallel...');
        
        const searchPromises = [
          getImages(userMessage).catch(err => {
            console.error('❌ Error fetching images:', err);
            return [];
          }),
          getSearchResults(userMessage).catch(err => {
            console.error('❌ Error fetching search results:', err);
            return [];
          }),
          getVideos(userMessage).catch(err => {
            console.error('❌ Error fetching videos:', err);
            return [];
          }),
          functionCalling(userMessage).catch(err => {
            console.error('❌ Error in function calling:', err);
            return null;
          }),
        ];

        const [images, sources, videos, conditionalFunctionCallUI] = await Promise.all(searchPromises);

        console.log('📊 Search data fetched:', {
          images: images?.length || 0,
          sources: sources?.length || 0,
          videos: videos?.length || 0,
          hasFunctionCall: !!conditionalFunctionCallUI,
          imagesType: typeof images,
          sourcesType: typeof sources,
          videosType: typeof videos
        });

        // Log the actual data structure
        console.log('🔍 Detailed search results:', {
          imagesData: images,
          sourcesData: sources,
          videosData: videos
        });

        // Update with search results
        console.log('🔄 Updating stream with search results...');
        const searchUpdate = { searchResults: sources, images, videos };
        console.log('📤 Sending search update:', searchUpdate);
        streamable.update(searchUpdate);
        console.log('✅ Search results sent to stream');

        if (config.useFunctionCalling && conditionalFunctionCallUI) {
          console.log('🔄 Updating stream with function call UI...');
          streamable.update({ conditionalFunctionCallUI });
          console.log('✅ Function call UI sent to stream');
        }

        // Process content
        console.log('🔄 Processing content...');
        const html = await get10BlueLinksContents(sources);
        console.log('📄 HTML content length:', html?.length || 0);
        
        const vectorResults = await processAndVectorizeContent(html, userMessage);
        console.log('🔢 Vector results:', vectorResults?.length || 0);
        
        console.log('🤖 Starting LLM response...');
        const accumulatedLLMResponse = await streamingChatCompletion(userMessage, vectorResults, streamable);
        console.log('✅ LLM response completed, length:', accumulatedLLMResponse?.length || 0);
        
        console.log('❓ Generating follow-up questions...');
        const followUp = await relevantQuestions(sources, userMessage);
        console.log('❓ Follow-up questions generated:', followUp?.choices?.length || 0);

        console.log('🔄 Updating stream with follow-up...');
        streamable.update({ followUp });
        console.log('✅ Follow-up sent to stream');

        // Cache the results
        console.log('💾 Caching results...');
        setInSemanticCache(userMessage, {
          searchResults: sources,
          images,
          videos,
          conditionalFunctionCallUI: config.useFunctionCalling ? conditionalFunctionCallUI : undefined,
          llmResponse: accumulatedLLMResponse,
          followUp,
          semanticCacheKey: userMessage
        });
        console.log('✅ Results cached');

        console.log('✅ Action completed successfully');
        streamable.done({ llmResponseEnd: true });
      }
    } catch (error) {
      console.error('❌ Action error:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // Update with error information
      streamable.update({ 
        llmResponse: 'An error occurred while processing your request. Please try again.',
        status: 'error'
      });
      
      try {
        streamable.done({ llmResponseEnd: true });
      } catch (closeError) {
        console.error('❌ Error closing stream:', closeError);
      }
    }
  })();

  return streamable.value;
}

const initialAIState: {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id?: string;
  name?: string;
}[] = [];

const initialUIState: {
  id: number;
  display: React.ReactNode;
}[] = [];

export const AI = createAI({
  actions: {
    myAction,
    clearSemanticCache
  },
  initialUIState,
  initialAIState,
});

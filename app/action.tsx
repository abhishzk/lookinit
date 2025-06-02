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
  const streamable = createStreamableValue({});

  (async () => {
    try {
      console.log('🚀 Action started:', { userMessage, mentionTool });
      
      if (mentionTool) {
        await checkRateLimit(streamable);
        await initializeSemanticCache();

        const cachedData = await getFromSemanticCache(userMessage);
        if (cachedData) {
          console.log('💾 Returning cached data');
          streamable.update({ cachedData });
          streamable.done(); // ✅ Add this
          return;
        }

        await lookupTool(mentionTool, userMessage, streamable, file);
        streamable.done(); // ✅ Add this
      } else {
        console.log('🔍 Starting search operations...');
        
        const [images, sources, videos, conditionalFunctionCallUI] = await Promise.all([
          getImages(userMessage),
          getSearchResults(userMessage),
          getVideos(userMessage),
          functionCalling(userMessage),
        ]);

        console.log('📊 Search results:', {
          images: images?.length || 0,
          sources: sources?.length || 0,
          videos: videos?.length || 0
        });

        streamable.update({ searchResults: sources, images, videos });

        if (config.useFunctionCalling) {
          streamable.update({ conditionalFunctionCallUI });
        }

        const html = await get10BlueLinksContents(sources);
        console.log('📄 Content processing completed');
        
        const vectorResults = await processAndVectorizeContent(html, userMessage);
        console.log('🔍 Vector processing completed');
        
        const accumulatedLLMResponse = await streamingChatCompletion(userMessage, vectorResults, streamable);
        console.log('💬 LLM response completed');
        
        const followUp = await relevantQuestions(sources, userMessage);
        console.log('❓ Follow-up questions generated');

        // ✅ Fix serialization issue - extract only the content
        const serializedFollowUp = followUp?.choices?.[0]?.message?.content 
          ? { choices: [{ message: { content: followUp.choices[0].message.content } }] }
          : null;

        streamable.update({ followUp: serializedFollowUp });

        setInSemanticCache(userMessage, {
          searchResults: sources,
          images,
          videos,
          conditionalFunctionCallUI: config.useFunctionCalling ? conditionalFunctionCallUI : undefined,
          llmResponse: accumulatedLLMResponse,
          followUp: serializedFollowUp,
          semanticCacheKey: userMessage
        });

        // ✅ Mark LLM response as ended
        streamable.update({ llmResponseEnd: true });
        streamable.done();
      }
      
      console.log('✅ Action completed successfully');
      
    } catch (error) {
      console.error('❌ Action error:', error);
      streamable.update({ 
        status: 'error',
        llmResponseEnd: true 
      });
      streamable.done(); // ✅ Always close stream
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
"use server"

// 1. Import dependencies
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// 2. Initialize OpenAI client (make it optional)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Define Zod schema for URL extraction
const UrlExtraction = z.object({
    url: z.string(),
});

// Simple URL extraction fallback function
function extractUrlFallback(text: string): string | null {
    // Simple regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    
    if (matches && matches.length > 0) {
        return matches[0];
    }
    
    // Try to find domain patterns
    const domainRegex = /([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/g;
    const domainMatches = text.match(domainRegex);
    
    if (domainMatches && domainMatches.length > 0) {
        return `https://${domainMatches[0]}`;
    }
    
    return null;
}

// Content structuring function
function improveContentStructure(content: string): string {
    console.log('=== STRUCTURING DEBUG ===');
    console.log('Input content length:', content.length);
    console.log('Input content preview:', content.substring(0, 100));
    
    // Basic cleaning
    let cleaned = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags if any
        .replace(/\s+/g, ' ') // Multiple spaces to single
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Multiple line breaks to double
        .trim();

    // Split into chunks and add basic structure
    const chunks = cleaned.split(/\n\n+/).filter(chunk => chunk.trim().length > 30);
    
    console.log('Found chunks:', chunks.length);
    chunks.forEach((chunk, i) => {
        console.log(`Chunk ${i + 1} preview:`, chunk.substring(0, 50));
    });
    
    let structured = '## 📄 Website Content\n\n';
    structured += `*Extracted ${chunks.length} content sections from ${content.length} characters*\n\n`;
    
    if (chunks.length > 1) {
        chunks.slice(0, 5).forEach((chunk, index) => {
            const trimmedChunk = chunk.trim().substring(0, 300);
            structured += `### 📝 Section ${index + 1}\n${trimmedChunk}${chunk.length > 300 ? '...' : ''}\n\n`;
        });
        
        if (chunks.length > 5) {
            structured += `*... and ${chunks.length - 5} more sections*\n\n`;
        }
    } else {
        // Single block of content
        const trimmedContent = cleaned.substring(0, 1000);
        structured += `### 📝 Main Content\n${trimmedContent}${cleaned.length > 1000 ? '...' : ''}\n\n`;
    }
    
    console.log('Final structured length:', structured.length);
    console.log('=== END DEBUG ===');
    
    return structured;
}

// 3. Define the main function
export async function brightDataWebScraper(mentionTool: string, userMessage: string, streamable: any) {
    let targetUrl: string;
    let streamClosed = false;
    
    // Helper function to safely update stream
    const safeUpdate = (content: any) => {
        if (!streamClosed) {
            try {
                streamable.update(content);
            } catch (error) {
                console.error('Stream update error:', error);
                streamClosed = true;
            }
        }
    };

    // Helper function to safely close stream
    const safeClose = (content: any) => {
        if (!streamClosed) {
            try {
                streamable.done(content);
                streamClosed = true;
            } catch (error) {
                console.error('Stream close error:', error);
                streamClosed = true;
            }
        }
    };
    
    try { 
        // 4. Extract URL from user message
        let extractedUrl = '';
        
        if (openai) {
            try {
                // Try OpenAI first
                const urlCompletion = await openai.beta.chat.completions.parse({
                    model: "gpt-4o-2024-08-06",
                    messages: [
                        { role: "system", content: "Extract the most likely valid URL from a natural language query." },
                        { role: "user", content: userMessage }
                    ],
                    response_format: zodResponseFormat(UrlExtraction, "extractedUrl"),
                });
                extractedUrl = urlCompletion.choices[0]?.message?.parsed?.url ?? '';
            } catch (openaiError) {
                console.log('OpenAI URL extraction failed, using fallback');
                extractedUrl = extractUrlFallback(userMessage) || '';
            }
        } else {
            // Use fallback if no OpenAI API key
            extractedUrl = extractUrlFallback(userMessage) || '';
        }

        if (!extractedUrl) {
            safeUpdate({ llmResponse: `No valid URL found in the user message. Please provide a clear URL like: https://example.com \n\n` });
            safeClose({ llmResponseEnd: true });
            return;
        }

        safeUpdate({ llmResponse: `🔍 Extracting information from: [${extractedUrl}](${extractedUrl})\n\n` });
        targetUrl = extractedUrl;

        // Add a small delay to ensure the update is processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // 6. Make API request to Bright Data
        safeUpdate({ llmResponse: `📡 Connecting to website...\n\n` });
        
        const baseUrl = process.env.URL 
            ? process.env.URL 
            : process.env.NODE_ENV === 'production' 
                ? 'https://lookinit.netlify.app' 
                : 'http://localhost:3000';
        
        const apiUrl = `${baseUrl}/api/bright-data`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: targetUrl, query: userMessage }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 7. Process API response
        const responseData = await response.json();

        if (!responseData.content) {
            throw new Error('No content received from the server');
        }

        // Add debugging to see what we're actually getting
        console.log('Raw content type:', typeof responseData.content);
        console.log('Raw content length:', responseData.content.length);
        console.log('Raw content sample:', responseData.content.substring(0, 200));

        safeUpdate({ llmResponse: `✅ Content extracted successfully!\n\n` });
        
        let contentForLLM = responseData.content;

        // 8. Summarize content using OpenAI or return raw content
        if (openai) {
            try {
                safeUpdate({ llmResponse: `🤖 Generating AI summary...\n\n` });
                
                // Truncate content if it's too large (GPT-4 has token limits)
                const maxContentLength = 8000; // Adjust based on model limits
                const truncatedContent = contentForLLM.length > maxContentLength 
                    ? contentForLLM.substring(0, maxContentLength) + "..."
                    : contentForLLM;
                
                const summaryStream = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    stream: true,
                    messages: [
                        { role: "system", content: "Always respond in valid markdown format to the user query based on the context provided" },
                        { role: "user", content: `Here is the context: <context>${truncatedContent}</context> Response to the user query: ${userMessage}` }
                    ]
                });

                // 9. Process and stream summary chunks
                for await (const chunk of summaryStream) {
                    if (streamClosed) break; // Exit if stream is closed
                    
                    if (chunk.choices[0]?.delta?.content) {
                        safeUpdate({ llmResponse: chunk.choices[0].delta.content });
                    }
                }
            } catch (openaiError) {
                console.error('OpenAI summarization error details:', openaiError);
                
                // More specific error handling
                let errorMessage = 'AI summarization unavailable';
                if (openaiError instanceof Error) {
                    if (openaiError.message.includes('quota')) {
                        errorMessage = 'OpenAI quota exceeded';
                    } else if (openaiError.message.includes('rate')) {
                        errorMessage = 'Rate limit reached';
                    } else if (openaiError.message.includes('model')) {
                        errorMessage = 'AI model not available';
                    } else if (openaiError.message.includes('token')) {
                        errorMessage = 'Content too large for AI processing';
                    }
                }
                
                // Fallback: return structured raw content
                const structuredContent = improveContentStructure(contentForLLM);
                safeUpdate({ 
                    llmResponse: `${structuredContent}\n*Note: ${errorMessage}, showing structured content.*\n\n` 
                });
            }
        } else {
            // No OpenAI available, return structured raw content
            const structuredContent = improveContentStructure(contentForLLM);
            safeUpdate({ 
                llmResponse: `${structuredContent}\n*Note: AI summarization unavailable, showing structured content.*\n\n` 
            });
        }

        safeClose({ llmResponseEnd: true });
        
    } catch (error: unknown) {
        // 10. Error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Bright Data scraper error:', errorMessage);
        
        let userFriendlyMessage = `❌ Sorry, I was unable to get information from the website.\n\n`;
        
        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            userFriendlyMessage += '🚫 **Issue**: AI services are temporarily unavailable due to quota limits.\n\n';
            userFriendlyMessage += '💡 **Solution**: The website content extraction may still work but without AI summarization.';
        } else if (errorMessage.includes('No content received')) {
            userFriendlyMessage += '🚫 **Issue**: The website data could not be processed correctly.\n\n';
            userFriendlyMessage += '💡 **Possible causes**: Changes in website structure, anti-bot protection, or temporary issues.';
        } else if (errorMessage.includes('No valid URL')) {
            userFriendlyMessage += '🚫 **Issue**: No valid URL found in your message.\n\n';
            userFriendlyMessage += '💡 **Example**: Try "Summarize https://example.com" or "Extract content from https://news.ycombinator.com"';
        } else if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('localhost:3001')) {
            userFriendlyMessage += '🚫 **Issue**: Bright Data service is not running.\n\n';
            userFriendlyMessage += '💡 **Solution**: Make sure your Bright Data API endpoint is running on localhost:3001';
        } else {
            userFriendlyMessage += `🚫 **Error**: ${errorMessage}`;
        }
        
        safeUpdate({ llmResponse: userFriendlyMessage });
        safeClose({ llmResponseEnd: true });
    }
}

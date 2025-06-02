import { config } from '../config';
import * as cheerio from 'cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document as DocumentInterface } from 'langchain/document';
import { OpenAIEmbeddings } from '@langchain/openai';
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

let embeddings: OllamaEmbeddings | OpenAIEmbeddings;
if (config.useOllamaEmbeddings) {
    embeddings = new OllamaEmbeddings({
        model: config.embeddingsModel,
        baseUrl: "http://localhost:11434"
    });
} else {
    embeddings = new OpenAIEmbeddings({
        modelName: config.embeddingsModel
    });
}

interface SearchResult {
    title: string;
    link: string;
    favicon: string;
}

interface ContentResult extends SearchResult {
    html: string;
}

// ✅ Fetch contents of top 10 search results with better error handling
export async function get10BlueLinksContents(sources: SearchResult[]): Promise<ContentResult[]> {
    console.log('📄 Starting content fetch for', sources.length, 'sources');
    
    // ✅ Increase timeout and improve error handling
    async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            
            const response = await fetch(url, { 
                ...options, 
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SearchBot/1.0)',
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            console.log(`⚠️ Failed to fetch ${url}:`, error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    function extractMainContent(html: string): string {
        try {
            const $ = cheerio.load(html);
            $("script, style, head, nav, footer, iframe, img").remove();
            return $("body").text().replace(/\s+/g, " ").trim();
        } catch (error) {
            console.error('❌ Error extracting main content:', error);
            throw error;
        }
    }

    const promises = sources.map(async (source): Promise<ContentResult | null> => {
        try {
            console.log('🔍 Fetching:', source.link);
            
            const response = await fetchWithTimeout(source.link, {}, 5000);
            
            if (!response.ok) {
                console.log(`⚠️ HTTP ${response.status} for ${source.link}`);
                return null;
            }
            
            const html = await response.text();
            const mainContent = extractMainContent(html);
            
            if (mainContent.length < 100) {
                console.log(`⚠️ Content too short for ${source.link}`);
                return null;
            }
            
            console.log(`✅ Successfully processed ${source.link} (${mainContent.length} chars)`);
            return { ...source, html: mainContent };
            
        } catch (error: unknown) {
            console.log(`❌ Error processing ${source.link}:`, error instanceof Error ? error.message : String(error));
            return null;
        }
    });
    try {
        const results = await Promise.all(promises);
        const validResults = results.filter((source): source is ContentResult => source !== null);
        
        console.log(`📊 Content processing complete: ${validResults.length}/${sources.length} successful`);
        return validResults;
        
    } catch (error) {
        console.error('❌ Error fetching and processing blue links contents:', error);
        return []; // ✅ Return empty array instead of throwing
    }
}

// ✅ Process and vectorize content using LangChain with better error handling
export async function processAndVectorizeContent(
    contents: ContentResult[],
    query: string,
    textChunkSize = config.textChunkSize,
    textChunkOverlap = config.textChunkOverlap,
    numberOfSimilarityResults = config.numberOfSimilarityResults,
): Promise<DocumentInterface[]> {
    console.log('🔍 Starting vectorization for', contents.length, 'content pieces');
    
    if (!contents || contents.length === 0) {
        console.log('⚠️ No content to vectorize');
        return [];
    }
    
    const allResults: DocumentInterface[] = [];
    
    try {
        for (let i = 0; i < contents.length; i++) {
            const content = contents[i];
            
            if (!content.html || content.html.length === 0) {
                console.log(`⚠️ Skipping empty content for ${content.link}`);
                continue;
            }
            
            try {
                console.log(`🔄 Processing content ${i + 1}/${contents.length}: ${content.title}`);
                
                const splitText = await new RecursiveCharacterTextSplitter({ 
                    chunkSize: textChunkSize, 
                    chunkOverlap: textChunkOverlap 
                }).splitText(content.html);
                
                if (splitText.length === 0) {
                    console.log(`⚠️ No text chunks for ${content.link}`);
                    continue;
                }
                
                const vectorStore = await MemoryVectorStore.fromTexts(
                    splitText, 
                    { title: content.title, link: content.link }, 
                    embeddings
                );
                
                const contentResults = await vectorStore.similaritySearch(query, numberOfSimilarityResults);
                allResults.push(...contentResults);
                
                console.log(`✅ Added ${contentResults.length} chunks from ${content.title}`);
                
            } catch (error) {
                console.error(`❌ Error processing content for ${content.link}:`, error);
                // Continue with other content instead of failing completely
            }
        }
        
        console.log(`📊 Vectorization complete: ${allResults.length} total chunks`);
        return allResults;
        
    } catch (error) {
        console.error('❌ Error processing and vectorizing content:', error);
        return []; // ✅ Return empty array instead of throwing
    }
}

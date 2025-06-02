"use server";
import { SearchResult } from '@/components/answer/SearchResultsComponent';
import { config } from '../config';

async function retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 2,
    delay: number = 1000
): Promise<T> {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await operation();
      } catch (error: unknown) {
        if (i === maxRetries) throw error;
        console.log(`🔄 Retry ${i + 1}/${maxRetries} after error:`, error instanceof Error ? error.message : String(error));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
}
export async function getSearchResults(userMessage: string): Promise<any> {
    try {
      return await retryOperation(() => {
        switch (config.searchProvider) {
          case "brave":
            return braveSearch(userMessage);
          case "serper":
            return serperSearch(userMessage);
          case "google":
            return googleSearch(userMessage);
          default:
            throw new Error(`Unsupported search provider: ${config.searchProvider}`);
        }
      });
    } catch (error) {
      console.error('❌ All search providers failed:', error);
      // Return empty results instead of throwing
      return [];
    }
}

export async function braveSearch(message: string, numberOfPagesToScan = config.numberOfPagesToScan): Promise<SearchResult[]> {
      try {
          const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(message)}&count=${numberOfPagesToScan}`, {
              headers: {
                  'Accept': 'application/json',
                  'Accept-Encoding': 'gzip',
                  "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY as string
              }
          });
          if (!response.ok) {
              console.log('Issue with response from Brave Search API');
          }
          const jsonResponse = await response.json();
          if (!jsonResponse.web || !jsonResponse.web.results) {
              throw new Error('Invalid API response format');
          }
          const final = jsonResponse.web.results.map((result: any): SearchResult => ({
              title: result.title,
              link: result.url,
              favicon: result.profile.img
          }));
          return final;
      } catch (error) {
          console.error('Error fetching search results:', error);
          throw error;
      }
}

export async function googleSearch(message: string, numberOfPagesToScan = config.numberOfPagesToScan): Promise<SearchResult[]> {
      try {
          const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_CX}&q=${encodeURIComponent(message)}&num=${numberOfPagesToScan}`;
          const response = await fetch(url);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const jsonResponse = await response.json();
          if (!jsonResponse.items) {
              throw new Error('Invalid API response format');
          }
          const final = jsonResponse.items.map((result: any): SearchResult => ({
              title: result.title,
              link: result.link,
              favicon: result.pagemap?.cse_thumbnail?.[0]?.src || ''
          }));
          return final;
      } catch (error) {
          console.error('Error fetching search results:', error);
          throw error;
      }
}

export async function serperSearch(message: string, numberOfPagesToScan = config.numberOfPagesToScan): Promise<SearchResult[]> {
    const url = 'https://google.serper.dev/search';
  
    if (!process.env.SERPER_API) {
      console.error('❌ SERPER_API key not found');
      return [];
    }
  
    const data = JSON.stringify({ "q": message });
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API as string,
        'Content-Type': 'application/json'
      },
      body: data
    };
  
    try {
      console.log('🔍 Serper search for:', message);
    
      const response = await fetch(url, requestOptions);
    
      if (!response.ok) {
        throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
      }
    
      const responseData = await response.json();
    
      if (!responseData.organic) {
        console.warn('⚠️ No organic results from Serper');
        return [];
      }
    
      const results = responseData.organic.map((result: any): SearchResult => ({
        title: result.title,
        link: result.link,
        favicon: result.favicons?.[0] || ''
      }));
    
      console.log(`✅ Serper returned ${results.length} results`);
      return results;
    
    } catch (error) {
      console.error('❌ Serper search failed:', error);
      throw error; // Let retry logic handle this
    }
}

export async function getImages(message: string): Promise<{ title: string; link: string }[]> {
    if (!process.env.SERPER_API) {
      console.error('❌ SERPER_API key not found for images');
      return [];
    }
  
    try {
      return await retryOperation(async () => {
        const response = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API as string,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "q": message })
        });
      
        if (!response.ok) {
          throw new Error(`Images API error: ${response.status}`);
        }
      
        const responseData = await response.json();
      
        if (!responseData.images) {
          return [];
        }
      
        // Simplified - don't validate each image URL (too slow)
        const results = responseData.images
          .slice(0, 9)
          .map((image: any) => ({
            title: image.title || 'Image',
            link: image.imageUrl,
          }))
          .filter((img: any) => img.link && typeof img.link === 'string');
      
        console.log(`✅ Images: ${results.length} found`);
        return results;
      });
    } catch (error) {
      console.error('❌ Image search failed:', error);
      return []; // Return empty array instead of throwing
    }
}

export async function getVideos(message: string): Promise<{ imageUrl: string, link: string }[] | null> {
    if (!process.env.SERPER_API) {
      console.error('❌ SERPER_API key not found for videos');
      return [];
    }
  
    try {
      return await retryOperation(async () => {
        const response = await fetch('https://google.serper.dev/videos', {
          method: 'POST',
          headers: {
            'X-API-KEY': process.env.SERPER_API as string,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "q": message })
        });
      
        if (!response.ok) {
          throw new Error(`Videos API error: ${response.status}`);
        }
      
        const responseData = await response.json();
      
        if (!responseData.videos) {
          return [];
        }
      
        // Simplified - don't validate each video thumbnail (too slow)
        const results = responseData.videos
          .slice(0, 9)
          .map((video: any) => ({
            imageUrl: video.imageUrl,
            link: video.link
          }))
          .filter((vid: any) => vid.imageUrl && vid.link);
      
        console.log(`✅ Videos: ${results.length} found`);
        return results;
      });
    } catch (error) {
      console.error('❌ Video search failed:', error);
      return []; // Return empty array instead of throwing
    }
}
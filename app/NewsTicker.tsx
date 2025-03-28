import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

interface NewsItem {
  title: string;
  link: string;
  image: string;
}

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/news');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Error ${response.status}: ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        // Gnews API has a different structure than NewsAPI
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Invalid data format received from API');
        }
        
        // Map Gnews response to our NewsItem format
        const headlines = data.articles.map((article: any) => ({
          title: article.title,
          link: article.url,
          image: article.image || 'https://via.placeholder.com/150',
          // Gnews uses 'image' instead of 'urlToImage'
        }));
        
        setNews(headlines);
      } catch (error) {
        console.error('Error in news ticker:', error);
        setError(`Failed to load news: ${error instanceof Error ? error.message : 'route error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-gray-100 dark:bg-[#1B1C1D] py-4 h-20 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading news...</p>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gray-100 dark:bg-[#1B1C1D] py-4 h-20 flex items-center justify-center">
        <p className="text-red-500">{error || "No news available"}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gray-100 dark:bg-[#1B1C1D] py-4 h-20 flex items-center scrollbar-hide animate-scroll">
      <Marquee speed={30} gradient={false} pauseOnHover={true}>
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex bg-white dark:bg-[#282a2c] shadow-md rounded-lg p-4 w-[20rem] h-20 hover:shadow-lg transition-shadow duration-300 mx-3 news-item-hover"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-15 h-15 object-cover rounded-md mr-4"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.src = 'https://via.placeholder.com/150';
              }}
            />
            <div className="flex-1 overflow-hidden">
              <p
                className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2 line-clamp-2"
              >
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </Marquee>
    </div>
  );
}

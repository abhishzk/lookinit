import { useEffect, useState } from 'react';
import Marquee from 'react-fast-marquee';

interface NewsItem {
  title: string;
  link: string;
  image: string;
}

export default function NewsTicker() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
        );
        const data = await response.json();
        const headlines = data.articles.map((article: any) => ({
          title: article.title,
          link: article.url,
          image: article.urlToImage || 'https://via.placeholder.com/150',
        }));
        setNews(headlines);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="relative overflow-hidden bg-gray-100 dark:bg-[#1B1C1D] py-4 h-48 flex items-center scrollbar-hide animate-scroll">
      {/* <div className="flex space-x-6 overflow-x-auto scrollbar-hide animate-scroll w-full px-8"> */}
      <Marquee speed={30} gradient={false} pauseOnHover={true}>
        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex bg-white dark:bg-[#282a2c] shadow-md rounded-lg p-4 w-[20rem] h-24 hover:shadow-lg transition-shadow duration-300 mx-3 news-item-hover"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 object-cover rounded-md mr-4"
            />
            <div className="flex-1 overflow-hidden">
              <p
                className="text-sm text-gray-800 dark:text-gray-200 font-medium mb-2 line-clamp-3"
              >
                {item.title}
              </p>
            </div>
          </a>
        ))}
      </Marquee>
      </div>
    // </div>
  );
}

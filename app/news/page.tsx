'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface NewsItem {
  title: string;
  link: string;
  image: string;
  publishedAt: string;
  description: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data.articles || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error",
          description: "Failed to load news. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubscribe = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      toast({
        title: "Success",
        description: "You have successfully subscribed to the newsletter!",
        variant: "default",
      });
      setEmail(''); // Clear the input field
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12 dark:text-white">Latest News</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-300 dark:bg-[#3b3e41] animate-pulse"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 dark:bg-[#3b3e41] rounded animate-pulse mb-4"></div>
                <div className="h-4 bg-gray-300 dark:bg-[#3b3e41] rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-[#3b3e41] rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-[#3b3e41] rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, index) => (
            <div key={index} className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg overflow-hidden">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=News';
                  }}
                />
              )}
              <div className="p-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {item.publishedAt ? formatDate(item.publishedAt) : 'Recent'}
                </p>
                <h2 className="text-xl font-bold mb-3 dark:text-white">{item.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{item.description}</p>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Read more
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-12">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Load More News
        </Button>
      </div>
      
      <div className="mt-16 bg-gray-100 dark:bg-[#1e2022] rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Subscribe to Our Newsletter</h2>
        <p className="mb-6 dark:text-gray-300">Get the latest news and updates delivered directly to your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="email" 
            placeholder="Your email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#282a2c] dark:text-white"
          />
          <Button onClick={handleSubscribe}>Subscribe</Button>
        </div>
      </div>
    </div>
  );
}
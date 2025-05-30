'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrendingUp, FiUsers, FiBarChart2, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 142,
    views: 58400,
    authors: 18,
    engagement: 78
  });

  useEffect(() => {
    const token = localStorage.getItem('isAuthenticated');
    if (!token) {
      router.push('/login');
    } else {
      // Simulate API call with timeout
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsLoading(false);
      }, 1000);
    }
  }, [router]);

  const fetchDashboardStats = () => {
    setIsLoading(true);
    // Simulate API call with dummy data
    setTimeout(() => {
      setStats({
        posts: 142 + Math.floor(Math.random() * 10),
        views: 58400 + Math.floor(Math.random() * 1000),
        authors: 18 + Math.floor(Math.random() * 2),
        engagement: 78 + Math.floor(Math.random() * 3)
      });
      setIsLoading(false);
      toast.success('Stats refreshed with dummy data');
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Showing dummy data until API is ready
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          <FiRefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Posts" 
          value={stats.posts.toLocaleString()} 
          change={`+${Math.floor(Math.random() * 5) + 8}%`}
          icon={<FiFileText className="text-blue-500" size={20} />}
          color="bg-blue-100 dark:bg-blue-900/30"
        />
        <StatCard 
          title="Total Views" 
          value={`${(stats.views / 1000).toFixed(1)}K`} 
          change={`+${Math.floor(Math.random() * 10) + 15}%`}
          icon={<FiBarChart2 className="text-purple-500" size={20} />}
          color="bg-purple-100 dark:bg-purple-900/30"
        />
        <StatCard 
          title="Active Authors" 
          value={stats.authors.toString()} 
          change={`+${Math.floor(Math.random() * 2)}`}
          icon={<FiUsers className="text-emerald-500" size={20} />}
          color="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard 
          title="Engagement Rate" 
          value={`${stats.engagement}%`} 
          change={`+${Math.floor(Math.random() * 3) + 2}%`}
          icon={<FiTrendingUp className="text-amber-500" size={20} />}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      {/* Recent Activity Section with Dummy Data */}
      {/* <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <div className="bg-white px-6 py-4 dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity (Dummy Data)</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[
            { id: 1, action: 'New post published', author: 'Admin User', time: '2 minutes ago' },
            { id: 2, action: 'Post updated', author: 'Content Team', time: '1 hour ago' },
            { id: 3, action: 'New author joined', author: 'New User', time: '3 hours ago' },
            { id: 4, action: 'Engagement milestone reached', author: 'System', time: 'Yesterday' },
          ].map((activity) => (
            <div key={activity.id} className="bg-white px-6 py-4 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.time} • {activity.author}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  Sample
                </span>
              </div>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
};

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="rounded-lg bg-white/50 p-2 dark:bg-gray-700/50">
          {icon}
        </div>
      </div>
      <p className="mt-3 flex items-center text-sm font-medium text-green-600 dark:text-green-400">
        <FiTrendingUp className="mr-1" size={16} />
        {change} from last week
      </p>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import SingleBlog from "@/components/Blog/SingleBlog";
import Breadcrumb from "@/components/Common/Breadcrumb";

const Blog = () => {
  const [blogData, setBlogData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true); // Start loading
        const timestamp = new Date().getTime(); // Cache-busting query parameter
        const res = await fetch(`/api/blog?timestamp=${timestamp}`);

        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) {
          throw new Error(`Failed to fetch blog data: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        console.log("Fetched data:", res);
        setBlogData(json.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again later/Reload Page.");
      } finally {
        setIsLoading(false); // End loading
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Breadcrumb
        pageName="Our Page"
        description="Lookinit Blogs"
      />




<section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-gray-800">
  {/* Update floating elements for better contrast: */}
  <div className="absolute left-[5%] top-[15%] h-60 w-60 animate-[float_12s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-[80px]"></div>
  <div className="absolute right-[5%] bottom-[15%] h-64 w-64 animate-[float_14s_ease-in-out_infinite_reverse] rounded-full bg-gradient-to-r from-green-500/20 to-teal-500/20 blur-[80px]"></div>

        {/* Premium Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large floating circles */}
          <div className="absolute left-[5%] top-[15%] h-60 w-60 animate-[float_12s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-50/50 to-purple-50/50 blur-[80px] dark:from-blue-900/20 dark:to-purple-900/20"></div>
          <div className="absolute right-[5%] bottom-[15%] h-64 w-64 animate-[float_14s_ease-in-out_infinite_reverse] rounded-full bg-gradient-to-r from-green-50/50 to-teal-50/50 blur-[80px] dark:from-green-900/20 dark:to-teal-900/20"></div>

          {/* Medium floating elements */}
          <div className="absolute left-[15%] top-[60%] h-40 w-40 animate-[float_10s_ease-in-out_infinite] rounded-full bg-amber-50/40 blur-[60px] dark:bg-amber-900/15"></div>
          <div className="absolute right-[20%] top-[30%] h-32 w-32 animate-[float_8s_ease-in-out_infinite_reverse] rounded-full bg-rose-50/40 blur-[50px] dark:bg-rose-900/15"></div>

          {/* Small floating dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gray-300/30 dark:bg-gray-600/30"
              style={{
                width: `${Math.random() * 12 + 4}px`,
                height: `${Math.random() * 12 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 10}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.5}s`
              }}
            ></div>
          ))}
        </div>

        <div className="container relative z-10 py-12">
          {isLoading ? ( // Show loading animation while fetching
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
              <div
                className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status"
              >
                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                  Loading...
                </span>
              </div>
              <div className="text-center">
                <p className="text-xl font-medium text-gray-600 dark:text-gray-300">Loading blogs</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we fetch the latest content</p>
              </div>
            </div>
          ) : error ? (
            <div className="min-h-screen flex items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          ) : (
            <div className="-mx-4 flex flex-wrap justify-center gap-8">
              {blogData.map((blog) => (
                <div
                  key={blog._id}
                  className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
                >
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/80 shadow-sm transition-all hover:shadow-md backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <SingleBlog post={blog} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Blog;
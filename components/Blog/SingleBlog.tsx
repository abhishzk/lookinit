import { BlogPost } from "@/types/post";
import Image from "next/image";
import Link from "next/link";

const SingleBlog = ({ post }: { post: BlogPost | undefined }) => {
  if (!post) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p>Blog post data is unavailable.</p>
      </div>
    );
  }

  const { title, content, author, tags, createdAt, views, status } = post;

  // Generate image URLs
  const dummyImage = `https://picsum.photos/600/400?random=${tags[0] || 'blog'}`;
  const fallbackImage = "/images/placeholder.png"; // Use a static fallback image
  const imageUrl = dummyImage || fallbackImage; // Use fallback if dummyImage is unavailable
  const authorImage = `https://ui-avatars.com/api/?name=${author.split(' ').join('+')}&background=random`;

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-500 hover:shadow-2xl dark:bg-gray-900 ${status !== 'published' ? 'opacity-80' : ''}`}>
      {/* Status badge */}
      {status !== 'published' && (
        <span className="absolute right-4 top-4 z-20 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
          {status.toUpperCase()}
        </span>
      )}
      
      {/* Image with overlay */}
      <Link href={`/blog-details?id=${post._id}`} className="relative block aspect-video w-full">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        <Image 
          src={imageUrl} 
          alt={title} 
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      {/* Content */}
      <div className="p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span 
              key={index}
              className="rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 text-xs font-medium text-blue-800 dark:from-blue-900/50 dark:to-purple-900/50 dark:text-blue-200"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        <h3 className="mb-3 text-2xl font-bold leading-tight text-gray-900 dark:text-white">
          <Link
            href={`/blog-details?id=${post._id}`}
            className="transition-colors duration-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {title}
          </Link>
        </h3>
        
        <p className="mb-6 line-clamp-3 text-gray-600 dark:text-gray-300">
          {content}
        </p>
        
        {/* Footer with author, date, and views */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-700">
          <div className="flex items-center">
            <div className="relative mr-4 h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-md dark:border-gray-800">
              <Image 
                src={authorImage} 
                alt={author} 
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {author}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Author
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                {formattedDate}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Published
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;
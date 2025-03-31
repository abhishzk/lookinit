export default function Footer() {
  return (
    <div className="w-full text-center py-3 border-t dark:border-gray-800 bg-white dark:bg-[#1e2022] text-sm">
      <div className="max-w-3xl mx-auto flex justify-center space-x-6">
        <a href="/pro" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Pro</a>
        <a href="/enterprise" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Enterprise</a>
        <a href="/news" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">News</a>
        <a href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Blog</a>
      </div>
    </div>
  );
}

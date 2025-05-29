import Link from "next/link";

const Breadcrumb = ({
  pageName,
  description,
}: {
  pageName: string;
  description: string;
}) => {
  return (
    <section className="relative z-10 overflow-hidden pt-16 lg:pt-10 bg-gradient-to-br from-black-50 via-white to-yellow-50 dark:from-white-900 dark:via-purple-900/20 dark:to-black-800">
      <div className="container px-5 mx-auto ">
        <div className="flex flex-col ">
          {/* Simplified Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-white-400 mb-4">
            <Link href="/" className="hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <span className="text-gray-400 dark:text-gray-500"></span>
            <span className="text-primary">{pageName}</span>
          </div>
          
          {/* Clean Page Title */}
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {pageName}
            </h1>
            <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-secondary"></div>
          </div>
        </div>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden opacity-10 dark:opacity-5">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-[#2C303B] blur-3xl opacity-50"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 8 + 8}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`
            }}
          ></div>
        ))}
      </div>
    </section>
  );
};

export default Breadcrumb;
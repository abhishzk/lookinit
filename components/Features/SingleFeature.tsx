import { Feature } from "@/types/feature";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;

  return (
    <div
      // ref={featureRef}
      className="group relative w-full overflow-hidden rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-gray-800/80 dark:hover:shadow-gray-900/50"
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

      {/* Animated Background Blob */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 opacity-0 blur-xl transition-all duration-700 group-hover:opacity-100 group-hover:-right-5 group-hover:-top-5"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with 3D effect */}
        <div
          // ref={iconRef}
          className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-blue-500/30"
        >
          <div className="text-2xl">{icon}</div>
        </div>

        {/* Title with animated underline */}
        <h3 className="relative mb-5 text-xl font-bold text-black dark:text-white sm:text-2xl lg:text-xl xl:text-2xl">
          <span className="relative inline-block">
            {title}
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 group-hover:w-full"></span>
          </span>
        </h3>

        {/* Paragraph with smooth appearance */}
        <p className="text-base font-medium leading-relaxed text-gray-600 transition-colors duration-300 dark:text-gray-300">
          {paragraph}
        </p>
      </div>

      {/* Floating particles (matching hero style) */}
      <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-blue-500/30 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <div className="absolute top-4 right-6 h-1.5 w-1.5 rounded-full bg-purple-500/30 opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
    </div>
  );
};

export default SingleFeature;
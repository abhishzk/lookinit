import { Feature } from "@//types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <path d="M24 4L4 14V34L24 44L44 34V14L24 4Z" fill="url(#webdev-gradient)" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 16L16 20V28L24 32L32 28V20L24 16Z" fill="currentColor" opacity="0.8"/>
        <path d="M24 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 32V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 20L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 20L40 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28L8 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 28L40 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="webdev-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563EB"/>
            <stop offset="1" stopColor="#1E40AF"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Web Development",
    paragraph: "Get high-performance, responsive, and SEO-friendly websites tailored to your brand. We specialize in frontend & backend development using modern frameworks like React, Angular, Node.js, and more.",
  },
  {
    id: 2,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <rect x="8" y="8" width="32" height="32" rx="8" fill="url(#mobile-gradient)" stroke="currentColor" strokeWidth="2"/>
        <rect x="16" y="16" width="16" height="16" rx="2" fill="currentColor" opacity="0.8"/>
        <circle cx="24" cy="36" r="2" fill="currentColor"/>
        <defs>
          <linearGradient id="mobile-gradient" x1="24" y1="8" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#7C3AED"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Mobile App Development",
    paragraph: "Create cross-platform or native mobile apps (iOS & Android) that deliver seamless user experiences. Our apps are built with Flutter, React Native, Swift, or Kotlin for maximum performance.",
  },
  {
    id: 3,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <path d="M24 4C35 4 44 13 44 24C44 35 35 44 24 44C13 44 4 35 4 24C4 13 13 4 24 4Z" fill="url(#software-gradient)" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 12V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 24H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 18L18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 18L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="software-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981"/>
            <stop offset="1" stopColor="#059669"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Custom Software Development",
    paragraph: "We design and develop tailor-made software solutions to meet your unique business needs. From enterprise applications to workflow automation tools, we build scalable and secure software that enhances efficiency.",
  },
  {
    id: 4,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <path d="M24 4C35 4 44 13 44 24C44 35 35 44 24 44C13 44 4 35 4 24C4 13 13 4 24 4Z" fill="url(#marketing-gradient)" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36C30.6274 36 36 30.6274 36 24C36 17.3726 30.6274 12 24 12Z" fill="currentColor" opacity="0.8"/>
        <path d="M24 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 36V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 24H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 24H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="marketing-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EC4899"/>
            <stop offset="1" stopColor="#DB2777"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Digital Marketing",
    paragraph: "Boost your brand's online visibility, attract quality leads, and drive sales with our data-driven digital marketing strategies. We combine SEO, social media, PPC, and content marketing to create campaigns that deliver measurable results.",
  },
  {
    id: 5,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <path d="M24 4L4 14V34L24 44L44 34V14L24 4Z" fill="url(#consulting-gradient)" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 16L16 20V28L24 32L32 28V20L24 16Z" fill="currentColor" opacity="0.8"/>
        <path d="M24 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 32V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 20L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 20L40 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 28L8 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M32 28L40 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="consulting-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B"/>
            <stop offset="1" stopColor="#D97706"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "E-Commerce",
    paragraph: "Launch high-performance online stores with seamless UX, secure payments, and scalable infrastructure. We specialize in building custom e-commerce solutions using platforms like Shopify, WooCommerce, and headless setups.",
  },
  {
    id: 6,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" className="fill-current">
        <path d="M24 4C35 4 44 13 44 24C44 35 35 44 24 44C13 44 4 35 4 24C4 13 13 4 24 4Z" fill="url(#support-gradient)" stroke="currentColor" strokeWidth="2"/>
        <path d="M24 12V36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 24H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 18L18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 18L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id="support-gradient" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6"/>
            <stop offset="1" stopColor="#1D4ED8"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    title: "Maintenance & Support",
    paragraph: "Get 24/7 technical support, updates, and performance optimization to keep your software running smoothly post-launch.",
  },
];

export default featuresData;
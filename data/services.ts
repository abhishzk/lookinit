import featuresData from "@/components/Features/featuresData";

export interface Service {
  id: string;
  title: string;
  description: string;
  slug: string;
  longDescription?: string;
  benefits?: string[];
  process?: { title: string; description: string }[];
  updatedAt: string;
}

export const services: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    description: "Custom web applications built with modern technologies to meet your business needs.",
    slug: "web-development",
    longDescription: "At Speeir, we specialize in creating powerful, user-friendly, and scalable websites tailored to your business goals. Whether you're a startup looking to make your mark or an established company seeking a digital revamp, we deliver websites that not only look great but perform exceptionally.",
    benefits: [
      "Custom solutions tailored to your specific needs",
      "Responsive design that works on all devices",
      "Performance optimization for fast loading times",
      "SEO-friendly architecture",
      "Scalable solutions that grow with your business"
    ],
    process: [
      { title: "Discovery", description: "We start by understanding your business goals and requirements." },
      { title: "Planning", description: "Creating a detailed roadmap for your project." },
      { title: "Design", description: "Crafting user-friendly interfaces and experiences." },
      { title: "Development", description: "Building your application with clean, maintainable code." },
      { title: "Testing", description: "Ensuring quality through comprehensive testing." },
      { title: "Deployment", description: "Launching your application to production." },
      { title: "Support", description: "Ongoing maintenance and support after launch." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  },
  {
    id: "mobile-development",
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications for iOS and Android.",
    slug: "mobile-development",
    longDescription: "We develop high-quality mobile applications for iOS and Android platforms. Whether you need a native app or a cross-platform solution, our team has the expertise to deliver a mobile experience that engages your users and meets your business objectives.",
    benefits: [
      "Native performance and user experience",
      "Cross-platform options for broader reach",
      "Integration with device features",
      "Offline functionality",
      "App store optimization"
    ],
    process: [
      { title: "Strategy", description: "Defining your app's purpose and target audience." },
      { title: "UX/UI Design", description: "Creating intuitive and engaging user interfaces." },
      { title: "Development", description: "Building your app with the appropriate technology stack." },
      { title: "Testing", description: "Ensuring quality across devices and platforms." },
      { title: "Deployment", description: "Publishing your app to the app stores." },
      { title: "Maintenance", description: "Ongoing updates and support." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  },
  {
    id: "custom-software",
    title: "Custom Software Development",
    description: "Tailor-made software solutions for your unique business needs.",
    slug: "custom-software",
    longDescription: "We design and develop tailor-made software solutions to meet your unique business needs. From enterprise applications to workflow automation tools, we build scalable and secure software that enhances efficiency.",
    benefits: [
      "Tailored to your specific business processes",
      "Improved operational efficiency",
      "Scalable architecture for future growth",
      "Integration with existing systems",
      "Reduced long-term costs compared to off-the-shelf solutions"
    ],
    process: [
      { title: "Requirements Analysis", description: "Deeply understanding your business processes and needs." },
      { title: "Solution Architecture", description: "Designing the technical foundation of your software." },
      { title: "Development", description: "Building your custom solution with best practices." },
      { title: "Quality Assurance", description: "Rigorous testing to ensure reliability." },
      { title: "Deployment", description: "Smooth implementation into your business." },
      { title: "Maintenance", description: "Ongoing support and enhancements." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description: "Data-driven strategies to boost your online presence and drive growth.",
    slug: "digital-marketing",
    longDescription: "Boost your brand's online visibility, attract quality leads, and drive sales with our data-driven digital marketing strategies. We combine SEO, social media, PPC, and content marketing to create campaigns that deliver measurable results.",
    benefits: [
      "Increased online visibility and brand awareness",
      "Higher quality leads and conversions",
      "Data-driven strategies with measurable ROI",
      "Targeted campaigns to reach your ideal audience",
      "Comprehensive analytics and reporting"
    ],
    process: [
      { title: "Research", description: "Analyzing your market, competitors, and target audience." },
      { title: "Strategy Development", description: "Creating a customized marketing plan." },
      { title: "Campaign Creation", description: "Developing compelling content and campaigns." },
      { title: "Implementation", description: "Executing across relevant channels." },
      { title: "Monitoring", description: "Tracking performance in real-time." },
      { title: "Optimization", description: "Continuous improvement based on data." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  },
  {
    id: "e-commerce",
    title: "E-Commerce",
    description: "High-performance online stores with seamless user experience.",
    slug: "e-commerce",
    longDescription: "Launch high-performance online stores with seamless UX, secure payments, and scalable infrastructure. We specialize in building custom e-commerce solutions using platforms like Shopify, WooCommerce, and headless setups.",
    benefits: [
      "User-friendly shopping experience",
      "Secure payment processing",
      "Mobile-optimized design",
      "Inventory management integration",
      "Marketing and SEO features"
    ],
    process: [
      { title: "Store Planning", description: "Defining your product catalog and store structure." },
      { title: "Platform Selection", description: "Choosing the right e-commerce platform for your needs." },
      { title: "Design", description: "Creating a branded and conversion-focused store design." },
      { title: "Development", description: "Building your store with all required functionality." },
      { title: "Testing", description: "Ensuring a smooth checkout process and user experience." },
      { title: "Launch", description: "Going live with marketing support." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  },
  {
    id: "maintenance-support",
    title: "Maintenance & Support",
    description: "Ongoing technical support and optimization for your digital products.",
    slug: "maintenance-support",
    longDescription: "Get 24/7 technical support, updates, and performance optimization to keep your software running smoothly post-launch. Our maintenance services ensure your applications remain secure, up-to-date, and performing at their best.",
    benefits: [
      "Proactive monitoring and issue prevention",
      "Regular security updates and patches",
      "Performance optimization",
      "Technical support when you need it",
      "Reduced downtime and business disruption"
    ],
    process: [
      { title: "Assessment", description: "Evaluating your current systems and needs." },
      { title: "Support Plan", description: "Creating a tailored maintenance schedule." },
      { title: "Monitoring", description: "Proactive system monitoring." },
      { title: "Updates", description: "Regular software updates and security patches." },
      { title: "Support", description: "Responsive technical assistance." },
      { title: "Reporting", description: "Regular performance and status reports." }
    ],
    updatedAt: "2025-04-29T10:00:00.000Z"
  }
];

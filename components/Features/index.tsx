// import SectionTitle from "../Common/SectionTitle";
// import SingleFeature from "./SingleFeature";
// import featuresData from "./featuresData";
import Link from "next/link";
import { services } from "@/data/services";

const Features = () => {
  return (
    <>
      <section
        id="features"
        className="relative py-16 md:py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50/20 dark:from-gray-900 dark:to-gray-900/70 overflow-hidden"
      >
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-blue-400 animate-float1"></div>
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-purple-400 animate-float2"></div>
        </div>

        <div className="container relative z-10">
          {/* <SectionTitle
            title="Key Services"
            paragraph="Our Affordable, High-Impact Solutions"
            center
          /> */}

          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                Premium Services
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tailored Solutions
              </span>{" "}
              For Your Business
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Our comprehensive suite of services is designed to propel your business into the digital future with elegance and precision.
            </p>
          </div>

  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link 
                href={`/services/${service.slug}`} 
                key={service.id} 
                className="block group transform transition-all duration-500 hover:scale-[1.02]"
              >
                <div className="relative bg-white/70 dark:bg-gray-800/60 rounded-xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_35px_-5px_rgba(0,0,0,0.3)] backdrop-blur-md p-8 min-h-[360px] transition-all duration-500 hover:shadow-[0_20px_40px_-5px_rgba(79,70,229,0.2)] dark:hover:shadow-[0_20px_40px_-5px_rgba(139,92,246,0.3)] hover:-translate-y-1 h-full flex flex-col overflow-hidden border border-gray-100/50 dark:border-gray-700/30">
                  {/* Premium accent border on top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform origin-left transition-transform duration-500 scale-x-0 group-hover:scale-x-100"></div>
                  
                  {/* Subtle corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>
                  
                  {/* Service icon/decoration */}
                  <div className="relative z-10 w-16 h-16 mb-6 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 shadow-inner">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {service.title}
                    </h3>
                    
                    <div className="flex-grow">
                      <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed mb-6">
                        {service.description}
                      </p>
                    </div>
                    
                    {/* Premium button */}
                    <div className="mt-auto">
                      <div className="relative inline-flex group">
                        <div className="absolute transition-all duration-500 opacity-70 -inset-px bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg group-hover:opacity-100 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                        <span className="relative inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Explore Service
                          <svg className="w-4 h-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-0 left-0 right-0 hidden h-40 md:block">
          <div className="relative h-full w-full">
            <div className="absolute left-[10%] bottom-0 h-24 w-24 animate-[float_6s_ease-in-out_infinite] rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg backdrop-blur-sm"></div>
            <div className="absolute right-[10%] bottom-10 h-16 w-16 animate-[float_8s_ease-in-out_infinite_reverse] rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 shadow-lg backdrop-blur-sm"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
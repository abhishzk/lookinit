"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; // Changed from next/router

export default function EnterprisePage() {
  const router = useRouter();

  const navigateToForm = () => {
    router.push('/enterprise/form'); // Updated path to match the new file structure
  };

  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Enterprise Solutions</h1>
        <p className="text-xl text-gray-600 mb-8">
          Empower your business with Lookinit's powerful search technology. Discover how Lookinit can transform your search experience and boost productivity.
        </p>

        {/* Video Section */}
<div className="video-container mb-12 flex flex-col items-center justify-center">
    <h2 className="text-2xl font-semibold mb-4">Watch How Lookinit Works</h2>
    <div className="w-full max-w-[800px]">
        <iframe 
            src="https://drive.google.com/file/d/1OlgyyteA4mbDIhZcgpO6ckH-bk4UfAGY/preview?autoplay" 
            width="800" 
            height="480" 
            allow="autoplay"
            className="mx-auto"
        ></iframe>
    </div>
</div>


      </section>

      {/* Pricing Section */}
      <section className="pricing mb-12">
        <h2 className="text-3xl font-bold mb-4">Pricing Plans</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="pricing-card p-6 border rounded-lg shadow-lg flex flex-col items-center w-[400px] h-auto">
            <h3 className="text-xl font-semibold mb-4">Self Serve</h3>
            <p className="text-gray-600 mb-4">For growing teams with advanced needs.</p>
            <p className="text-2xl font-bold mb-4">€20/month</p>
            <ul className="text-gray-600 mb-4 text-center">
              <li>Up to 10 Users</li>
              <li>Advanced Search Features</li>
              <li>Priority Support</li>
            </ul>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-auto"
              onClick={navigateToForm}
            >
              Get Started
            </button>
          </div>

          <div className="pricing-card p-6 border rounded-lg shadow-lg flex flex-col items-center w-[400px] h-auto">
            <h3 className="text-xl font-semibold mb-4">Custom Plan</h3>
            <p className="text-gray-600 mb-4">Large enterprises with custom needs.</p>
            <p className="text-2xl font-bold mb-4">Contact us</p>
            <ul className="text-gray-600 mb-4 text-center">
              <li>Unlimited Users</li>
              <li>Custom Search Features</li>
              <li>Dedicated Support</li>
            </ul>
            <button
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mt-auto"
              onClick={navigateToForm}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features mb-12">
        <h2 className="text-3xl font-bold mb-4">Enterprise Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="feature-card p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Scalable Search</h3>
            <p className="text-gray-600">Easily scale your search capabilities to handle thousands of queries per minute, ensuring fast results at any volume.</p>
          </div>
          <div className="feature-card p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Custom Integrations</h3>
            <p className="text-gray-600">Seamlessly integrate Lookinit with your existing enterprise systems, such as CRMs, ERPs, and more.</p>
          </div>
          <div className="feature-card p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">Gain valuable insights into search patterns and user behavior to optimize your business decisions.</p>
          </div>
          <div className="feature-card p-6 border rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Dedicated Support</h3>
            <p className="text-gray-600">Get access to 24/7 dedicated support with a dedicated account manager to ensure your success.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact mb-12">
        <h2 className="text-3xl font-bold mb-4">Contact Us for More Information</h2>
        <p className="text-lg text-gray-600 mb-4">
          Have questions? Reach out to our team to learn more about Lookinit's enterprise solutions, and get a custom quote today.
        </p>
        <button
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          onClick={navigateToForm}
        >
          Contact Support
        </button>
      </section>
    </div>
  );
}

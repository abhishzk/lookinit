'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function CMSPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be replaced with actual form submission
    toast({
      title: "Request received",
      description: "We'll get back to you shortly about CMS access.",
    });
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-6 dark:text-white">Content Management System</h1>
      <p className="text-center text-lg mb-12 dark:text-gray-300">
        Manage your content efficiently with our powerful CMS solution.
      </p>
      
      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Features</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium dark:text-white">Intuitive Dashboard</h3>
                <p className="dark:text-gray-300">Manage all your content from a single, user-friendly dashboard.</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium dark:text-white">AI-Powered Content Creation</h3>
                <p className="dark:text-gray-300">Generate high-quality content with our advanced AI tools.</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium dark:text-white">Seamless Integration</h3>
                <p className="dark:text-gray-300">Easily integrate with your existing tools and workflows.</p>
              </div>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-medium dark:text-white">Advanced Analytics</h3>
                <p className="dark:text-gray-300">Track performance and gain insights with detailed analytics.</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 dark:text-white">Request CMS Access</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 font-medium dark:text-white">Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1e2022] dark:text-white"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="message" className="block mb-2 font-medium dark:text-white">Message</label>
              <textarea 
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1e2022] dark:text-white"
                required
              ></textarea>
            </div>
            <Button type="submit" className="w-full">Submit Request</Button>
          </form>
        </div>
      </div>
      
      <div className="bg-gray-100 dark:bg-[#1e2022] rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2 dark:text-white">Basic</h3>
            <p className="text-3xl font-bold mb-4 dark:text-white">$29<span className="text-lg font-normal">/month</span></p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Up to 5 users
              </li>
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Basic analytics
              </li>
            </ul>
            <Button className="w-full">Get Started</Button>
          </div>
          
          <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6 border-2 border-blue-500">
            <h3 className="text-xl font-bold mb-2 dark:text-white">Professional</h3>
            <p className="text-3xl font-bold mb-4 dark:text-white">$79<span className="text-lg font-normal">/month</span></p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Up to 20 users
              </li>
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Advanced analytics
              </li>
              <li className="flex items-center dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI content generation
              </li>
            </ul>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
          
          <div className="bg-white dark:bg-[#282a2c] rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-2 dark:text-white">Enterprise</h3>
            <p className="text-3xl font-bold mb-4 dark:text-white">$199<span className="text-lg font-normal">/month</span></p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Unlimited users
              </li>
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Custom integrations
              </li>
              <li className="flex items-center dark:text-gray-300">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Dedicated support
              </li>
            </ul>
            <Button className="w-full">Contact Sales</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
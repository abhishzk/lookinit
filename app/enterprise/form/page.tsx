"use client";

import React, { useState } from 'react';

export default function FormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Handle form submission logic here, e.g., send data to a server
    console.log("Form submitted");

    // After submission, reset the state
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Enterprise Inquiry Form</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="company">
            Company Name
          </label>
          <input
            type="text"
            id="company"
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="w-full border rounded-lg px-3 py-2"
            rows={4}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

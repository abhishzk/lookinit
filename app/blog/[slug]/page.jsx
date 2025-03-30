// /app/blog/[slug]/page.jsx
"use client"
import { useState } from 'react';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import blogs from "@/data/blogs"; // Import blog metadata

export default function BlogPostPage({ params }) {
  const { slug } = params; // Extract the slug from the URL
  const post = blogs.find((blog) => blog.slug === slug); // Find the blog by slug

  if (!post) {
    notFound(); // This will trigger a 404 if the post doesn't exist
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
      <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded" />
      <p className="text-gray-600 mt-4">{post.description}</p>
      <div className="mt-6">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  );
}

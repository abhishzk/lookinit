import Blog from "./BlogClient";


import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Lookinit",
  description: "Discover how Lookinit can empower your business, streamline workflows, and drive innovation. Explore use cases, solutions, and success stories tailored for your needs.",
  keywords: "Lookinit, use cases, solutions, business, innovation, workflow, success stories, AI, software",
  robots: "index, follow",
};


export default async function BlogPage() {
    return <Blog />;
  }

import Blog from "./BlogClient";


import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Speeir",
  description: "Stay updated with the latest insights, trends, and news from Speeir's blog.",
  keywords: "blog, articles, Ireland, Speeir, web development, application development, software solutions",
  robots: "index, follow",
};


export default async function BlogPage() {
    return <Blog />;
  }

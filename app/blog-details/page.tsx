import { Metadata } from "next";
import BlogDetailsClient from "./BlogDetailsClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const { id } = await searchParams;

  if (!id) {
    return {
      title: "Blog Not Found | Lookinit",
      description: "We couldn't find the blog you're looking for.",
      robots: "noindex, nofollow",
    };
  }

  try {
    const res = await fetch(`https://lookinit.com/api/blog/${id}`, {
      next: { revalidate: 60 }, // Optional: cache for 60s
    });
    const blog = await res.json();
    const { title, description, author, publishedAt, image } = blog.data;

    const blogUrl = `https://lookinit.com/blog-details?id=${id}`;


    return {
      title: `${title} | Lookinit`,
      description,
      alternates: {
        canonical: blogUrl,
      },
      openGraph: {
        type: "article",
        title: `${title} | Lookinit`,
        description,
        url: blogUrl,
        images: [{ url: image }],
        publishedTime: publishedAt,
        authors: [author],
      },
    };
  } catch (error) {
    return {
      title: "Blog",
      description: "An error occurred while loading the blog.",
      robots: "noindex, nofollow",
    };
  }
}

export default async function BlogDetailsPage() {
    return <BlogDetailsClient />;
  }

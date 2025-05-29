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
      title: "Blog Not Found | Speeir",
      description: "We couldn't find the blog you're looking for.",
      robots: "noindex, nofollow",
    };
  }

  try {
    const res = await fetch(`https://speeir.com/api/blog/${id}`, {
      next: { revalidate: 60 }, // Optional: cache for 60s
    });
    const blog = await res.json();
    const { title, description, author, publishedAt, image } = blog.data;

    const blogUrl = `https://speeir.com/blog-details?id=${id}`;


    return {
      title: `${title} | Speeir`,
      description,
      alternates: {
        canonical: blogUrl,
      },
      openGraph: {
        type: "article",
        title: `${title} | Speeir`,
        description,
        url: blogUrl,
        images: [{ url: image }],
        publishedTime: publishedAt,
        authors: [author],
      },
    };
  } catch (error) {
    return {
      title: "Blog Error | Lookinit",
      description: "An error occurred while loading the blog.",
      robots: "noindex, nofollow",
    };
  }
}

export default async function BlogDetailsPage() {
    return <BlogDetailsClient />;
  }

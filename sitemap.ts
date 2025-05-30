// app/sitemap.ts
export const revalidate = 86400; // 24 hours
import { MetadataRoute } from 'next';

interface Service {
  slug: string;
  updatedAt: string | Date;
}

interface BlogPost {
  _id: string;
  updatedAt: string | Date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.lookinit.com';
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {


    // Fetch blogs
    const res = await fetch(`${baseUrl}/api/blog`, {
      headers: { 'Cache-Control': 'no-store' }, 
    });

    const blogsData: BlogPost[] = res.ok ? (await res.json()).data || [] : [];

    const blogRoutes: MetadataRoute.Sitemap = blogsData.map((blog) => ({
      url: `${baseUrl}/blog-details?id=${blog._id}`, 
      lastModified: new Date(blog.updatedAt ?? now).toISOString(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes];

  } catch (error) {
    console.error('[SITEMAP ERROR]:', error);
    return staticRoutes;
  }
}

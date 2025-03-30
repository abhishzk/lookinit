// app/blog/page.jsx
import Link from "next/link";
import blogs from "@/data/blogs"; // Import blog metadata

export default function BlogPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Lookinit Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} className="block border rounded-lg p-4 shadow-lg hover:shadow-xl">
            <img src={blog.image} alt={blog.title} className="w-full h-40 object-cover rounded" />
            <h2 className="text-xl font-semibold mt-2">{blog.title}</h2>
            <p className="text-gray-600">{blog.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

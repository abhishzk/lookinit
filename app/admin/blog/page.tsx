'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/Admin/data-table';
import { BlogColumns } from '@/app/admin/blog/columns';
import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import { BlogModal } from './BlogModal'; // Ensure named import
import { toast } from 'sonner';
import {ObjectId} from 'mongodb';
import { BlogPost } from '@/types/post';

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // State for edit modal
  const [editingPost, setEditingPost] = useState(null); // Post being edited
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog`);
      const data = await response.json();
      // console.log("data",data);
      if (!response.ok) throw new Error(data.error || 'Failed to fetch posts');
      setPosts(data.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this post?'); // Confirmation dialog
      if (!confirmed) return;
      const response = await fetch(`/api/blog?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete post');
      setPosts((prev) => prev.filter((post) => post._id.toString() !== id));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const toggleStatus = async (post: any) => {
    try {
      const newStatus = post.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/blog?id=${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? { ...p, status: newStatus } : p))
      );
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const editPost = (post: any) => {
    setEditingPost(post); // Set the post to be edited
    setIsCreateOpen(true); // Open the BlogCreateModal in edit mode
  };

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <button
            onClick={fetchPosts}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New Post
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
        <DataTable 
          columns={BlogColumns} 
          data={posts} 
          loading={loading}
          meta={{
            onDelete: deletePost, // Pass the delete handler
            onEdit: editPost, // Pass the edit handler
            onToggleStatus: toggleStatus,
          }}
        />
      </div>

      <BlogModal 
        open={isCreateOpen}
        mode={editingPost ? 'edit' : 'create'} // Determine mode based on editingPost
        post={editingPost} // Pass the post to be edited
        onClose={() => {
          setIsCreateOpen(false);
          setEditingPost(null); // Reset editingPost after closing
        }}
        onSuccess={(updatedPost) => {
          if (editingPost) {
            // Update the post in the list
            setPosts((prev) =>
              prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
            );
            toast.success('Post updated successfully');
          } else {
            // Add the new post to the list
            setPosts([updatedPost, ...posts]);
            toast.success('Post created successfully');
          }
          setIsCreateOpen(false);
          setEditingPost(null); // Reset editingPost after success
        }}
      />
    </div>
  );
}
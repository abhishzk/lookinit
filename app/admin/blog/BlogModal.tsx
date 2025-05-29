'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function BlogModal({
  open,
  mode = 'create', // Default mode is 'create'
  post,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode?: 'create' | 'edit' | 'view'; // Add mode prop
  post?: any; // Post data for edit or view mode
  onClose: () => void;
  onSuccess?: (post: any) => void; // Optional for view mode
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    tags: [] as string[],
    status: 'draft',
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<{ content?: string }>({});

  useEffect(() => {
    if (post && (mode === 'edit' || mode === 'view')) {
      setFormData(post); // Populate form data for edit or view mode
    }
  }, [post, mode]);

  const validateForm = () => {
    const newErrors: { content?: string } = {};
    if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'view') return; // Prevent submission in view mode

    if (!validateForm()) {
      return; // Prevent submission if validation fails
    }

    setLoading(true);

    try {
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const url =
        mode === 'edit' && post?._id
          ? `/api/blog?id=${post._id}` // Corrected endpoint for PUT
          : '/api/blog'; // Default endpoint for POST
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Ensure formData includes all necessary fields
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save post');
      }

      const updatedPost = await response.json();
      toast.success(
        mode === 'edit' ? 'Post updated successfully!' : 'Post created successfully!'
      ); // Success toast
      if (onSuccess) onSuccess(updatedPost); // Notify parent component of success
      onClose();
      window.location.reload(); // Refresh the page after success
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred'); // Error toast
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
    toast.success('Tag removed successfully!'); // Success toast for tag removal
  };

  if (!open) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
  <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl dark:bg-gray-800 mx-4 max-h-[90vh] overflow-y-auto">
    {/* Header */}
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {mode === 'create' ? 'Create New Post' : mode === 'edit' ? 'Edit Post' : 'Post Details'}
      </h2>
      <button
        onClick={onClose}
        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>
    </div>

    {/* Form Content */}
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Title Field */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          readOnly={isReadOnly}
          className={`block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
          }`}
          placeholder="Enter post title"
        />
      </div>

      {/* Author Field */}
      <div className="space-y-2">
        <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Author
        </label>
        <input
          id="author"
          type="text"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          readOnly={isReadOnly}
          className={`block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
          }`}
          placeholder="Enter author name"
        />
      </div>

      {/* Content Field */}
      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Content
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          readOnly={isReadOnly}
          rows={8}
          className={`block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
            isReadOnly ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
          }`}
          placeholder="Write your content here..."
        />
      </div>

      {/* Tags Section (only for create/edit modes) */}
      {mode !== 'view' && (
        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Add tags..."
            />
            <button
              type="button"
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </button>
          </div>
          
          {/* Tags Display */}
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 dark:hover:bg-blue-800 dark:hover:text-blue-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Field (for edit mode) */}
      {mode === 'edit' && (
        <div className="space-y-2">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      )}

      {/* Action Buttons (only for create/edit modes) */}
      {mode !== 'view' && (
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </span>
            ) : mode === 'create' ? 'Create Post' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  </div>
</div>
  );
}
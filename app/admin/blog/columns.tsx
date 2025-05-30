// src/app/admin/blog/columns.tsx
import { ColumnDef } from '@/components/Admin/data-table';
import { BlogPost } from '@/types/post';

export const BlogColumns: ColumnDef<BlogPost>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || 'unknown'; // Add fallback value
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === 'published'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : status === 'draft'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' // Style for unknown status
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: 'views',
    header: 'Views',
    cell: ({ row }) => {
      return row.original.views ? row.original.views.toLocaleString() : 'N/A'; // Add fallback for undefined values
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row, table }) => {
      const post = row.original;
      const onEdit = table.options.meta?.onEdit; // Access onEdit from meta
      const onDelete = table.options.meta?.onDelete; // Access onDelete from meta

      return (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit && onEdit(post)} // Trigger the edit handler
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(post._id)} // Trigger the delete handler
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      );
    },
  },
];
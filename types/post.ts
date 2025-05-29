// src/types/blog.ts
import { ObjectId } from 'mongodb';

export interface BlogPostBase {
    title: string;
    content: string;
    author: string;
    tags: string[];
    views: number;
    status: 'published' | 'draft' | 'archived'; // Add the status property
  }
  
  export interface BlogPost extends BlogPostBase {
    _id: ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface BlogPostInsert extends Omit<BlogPost, '_id'> {}

  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    total?: number;    // For paginated responses
    page?: number;     // Current page number
    limit?: number;    // Items per page
  }
  
  export interface BlogPostCreateDTO extends Omit<BlogPostBase, 'views' | 'tags'> {
    tags?: string[];   // Make tags optional for creation
  }
  
  export interface BlogPostUpdateDTO extends Partial<Omit<BlogPostBase, 'views' | 'author'>> {
    tags?: string[]; // Ensure tags can be updated optionally
  }
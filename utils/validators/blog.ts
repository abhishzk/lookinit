// src/lib/validators/blog.ts
import { z } from 'zod';

const blogPostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10),
  author: z.string().min(3),
  tags: z.array(z.string()).optional(),
});

export function validateBlogPost(
  data: unknown, 
  isUpdate: boolean = false
): { success: boolean; error?: z.ZodError } {
  if (isUpdate) {
    // More lenient validation for updates
    const updateSchema = blogPostSchema.partial();
    const result = updateSchema.safeParse(data);
    return result;
  }
  
  return blogPostSchema.safeParse(data);
}
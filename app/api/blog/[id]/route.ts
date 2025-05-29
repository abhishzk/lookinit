// app/api/posts/[id]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/utils/dbConnect';
import type { BlogPost , ApiResponse } from '@/types/post';

// Helper for error responses
const errorResponse = (message: string, status: number) => {
    return NextResponse.json({ success: false, error: message }, { status });
  };
  
export async function GET(
  request: Request, { params } ): Promise<NextResponse<ApiResponse<BlogPost>>> {
  try {
    const db = await getDb();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return errorResponse('Invalid post ID', 400);
    }

    const post = await db.collection<BlogPost>('posts').findOne({
      _id: new ObjectId(id) as any
    });

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Increment views
    await db.collection('posts').updateOne(
      { _id: new ObjectId(post._id) },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        _id: post._id.toString()
      }
    });

  } catch (error) {
    console.error('GET Post Error:', error);
    return errorResponse('Failed to fetch post', 500);
  }
}
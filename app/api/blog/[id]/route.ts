export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';
import { 
  BlogPost, 
  ApiResponse, 
  BlogPostCreateDTO, 
  BlogPostUpdateDTO,
  BlogPostInsert
} from '@/types/post';
import { validateBlogPost } from '@/utils/validators/blog';

// Helper for error responses
const errorResponse = (message: string, status: number) => {
  return NextResponse.json({ success: false, error: message }, { status });
};

export async function GET(request: Request): Promise<NextResponse<ApiResponse<BlogPost | BlogPost[]>>> {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const page = parseInt(searchParams.get('page') || '1');
    
    // Optional filters
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const timestamp = searchParams.get('timestamp');
    
    const query: any = {};
    if (author) query.author = author;
    if (tag) query.tags = tag;
   
    const [posts, total] = await Promise.all([
      db.collection<BlogPost>('posts')  // CHANGED: from 'blog' to 'posts'
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection<BlogPost>('posts').countDocuments(query)  // CHANGED: from 'blog' to 'posts'
    ]);
    
    return NextResponse.json({
      success: true,
      data: posts.map(post => ({
        ...post,
        _id: post._id.toString()
      })),
      total,
      page,
      limit
    });
    
  } catch (error) {
    console.error('GET Error:', error);
    return errorResponse('Failed to fetch posts', 500);
  }
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse<BlogPost>>> {
  try {
    const db = await getDb();
    const body: BlogPostCreateDTO = await request.json();

    console.log('Incoming POST body:', body);

    // Validate input
    const validation = validateBlogPost(body);
    if (!validation.success) {
      console.error('Validation Error:', validation.error);
      return errorResponse(validation.error?.message ?? 'Validation failed', 400);
    }
    
    const newPost: BlogPostInsert = {
      ...body,
      tags: body.tags || [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection<Omit<BlogPost, '_id'>>('posts').insertOne(newPost);  // CHANGED
    const createdPost = await db.collection<BlogPost>('posts').findOne({  // CHANGED
      _id: result.insertedId
    });
    
    if (!createdPost) {
      return errorResponse('Failed to retrieve created post', 500);
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: {
          ...createdPost,
          _id: createdPost._id.toString()
        } 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('POST Error:', error);
    return errorResponse('Failed to create post', 500);
  }
}

export async function PUT(request: Request): Promise<NextResponse<ApiResponse<BlogPost>>> {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body: Partial<BlogPostUpdateDTO> = await request.json();

    if (!id || !ObjectId.isValid(id)) {
      return errorResponse('Valid post ID is required', 400);
    }

    const updateData = { ...body };
    if ('_id' in updateData) {
      delete updateData._id;
    }

    const result = await db.collection<BlogPost>('posts').updateOne(  // CHANGED
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return errorResponse('Post not found', 404);
    }

    const updatedPost = await db.collection<BlogPost>('posts').findOne({  // CHANGED
      _id: new ObjectId(id),
    });

    if (!updatedPost) {
      return errorResponse('Failed to retrieve updated post', 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...updatedPost,
        _id: updatedPost._id.toString(),
      },
    });
  } catch (error) {
    console.error('PUT Error:', error);
    return errorResponse('Failed to update post', 500);
  }
}

export async function DELETE(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || !ObjectId.isValid(id)) {
      return errorResponse('Valid post ID is required', 400);
    }
    
    const result = await db.collection<BlogPost>('posts').deleteOne({  // CHANGED
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return errorResponse('Post not found', 404);
    }
    
    return NextResponse.json({
      success: true,
      data: { id }
    });
    
  } catch (error) {
    console.error('DELETE Error:', error);
    return errorResponse('Failed to delete post', 500);
  }
}

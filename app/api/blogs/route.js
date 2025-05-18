import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';
import { createAdminClient } from '@/supabase-service-client';
import { getAuthUser } from '@/app/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Get blogs with pagination
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '9');
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const userId = url.searchParams.get('author');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('date', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (userId) {
      query = query.eq('author_id', userId);
    }
    
    const { data: blogs, count, error } = await query
      .range(offset, offset + limit - 1);
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new blog
export async function POST(request) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const blogData = await request.json();
    
    // Generate slug from title
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-') + '-' + uuidv4().substring(0, 8);
    
    // Prepare blog object
    const blog = {
      id: uuidv4(),
      title: blogData.title,
      author_id: user.userId,
      author_name: blogData.author_name || user.name || 'Anonymous',
      read_time: blogData.read_time || '5 min read',
      cover_image: blogData.cover_image,
      excerpt: blogData.excerpt,
      category: blogData.category,
      tags: blogData.tags || [],
      content: blogData.content,
      published: blogData.published || false,
      slug: slug
    };
    
    const { data, error } = await supabase
      .from('blogs')
      .insert(blog)
      .select();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Blog created successfully',
      blog: data[0]
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';
import { getAuthUser } from '@/app/lib/auth';

// Get blogs by authenticated user
export async function GET(request) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '9');
    
    const offset = (page - 1) * limit;
    
    const { data: blogs, count, error } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('author_id', user.userId)
      .order('created_at', { ascending: false })
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
    console.error('Error fetching user blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
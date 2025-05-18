import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';
import { getAuthUser } from '@/app/lib/auth';

// Get a single blog by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    // If blog is not published, check if the user is the author
    if (!blog.published) {
      const user = await getAuthUser(request);
      if (!user || user.userId !== blog.author_id) {
        return NextResponse.json(
          { error: 'Blog not found or not published' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a blog
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const updates = await request.json();
    
    // Check if the blog exists and the user is the author
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: fetchError.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    if (blog.author_id !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this blog' },
        { status: 403 }
      );
    }
    
    // Prepare updates
    const blogUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Don't allow changing the author
    delete blogUpdates.author_id;
    delete blogUpdates.id;
    
    const { data, error } = await supabase
      .from('blogs')
      .update(blogUpdates)
      .eq('id', id)
      .select();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: data[0]
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a blog
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Check if the blog exists and the user is the author
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: fetchError.code === 'PGRST116' ? 404 : 500 }
      );
    }
    
    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    if (blog.author_id !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this blog' },
        { status: 403 }
      );
    }
    
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
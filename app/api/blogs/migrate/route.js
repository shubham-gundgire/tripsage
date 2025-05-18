import { NextResponse } from 'next/server';
import { createAdminClient } from '@/supabase-service-client';
import blogData from '@/app/data/blogs.json';
import { v4 as uuidv4 } from 'uuid';

// Migrate blogs from JSON to database
export async function POST(request) {
  try {
    // Only allow in development environment or with proper authorization
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    const supabaseAdmin = createAdminClient();
    
    // Create a default admin user if it doesn't exist
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@example.com')
      .single();
      
    let adminUserId = adminUser?.id;
    
    if (!adminUserId) {
      // Create admin user
      const { data: newAdmin, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          name: 'Admin User',
          email: 'admin@example.com',
          password: '$2a$10$1JsQFxuuUAmPP1B/iUNwWeOLi9FsJpDDo7qp0b9IDYv4pChKyhzuu' // hashed "password123"
        })
        .select();
        
      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create admin user: ' + createError.message },
          { status: 500 }
        );
      }
      
      adminUserId = newAdmin[0].id;
    }
    
    // Check if blogs already exist
    const { count, error: countError } = await supabaseAdmin
      .from('blogs')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      return NextResponse.json(
        { error: 'Failed to check existing blogs: ' + countError.message },
        { status: 500 }
      );
    }
    
    if (count > 0) {
      return NextResponse.json(
        { message: 'Blogs already exist in the database. Migration skipped.' }
      );
    }
    
    // Transform blog data
    const blogs = blogData.blogs.map(blog => {
      // Generate slug from title
      const slug = blog.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-') + '-' + uuidv4().substring(0, 8);
        
      return {
        id: blog.id,
        title: blog.title,
        author_id: adminUserId,
        author_name: blog.author,
        date: new Date(blog.date).toISOString(),
        read_time: blog.readTime,
        cover_image: blog.coverImage,
        excerpt: blog.excerpt,
        category: blog.category,
        tags: blog.tags,
        content: blog.content,
        published: true,
        slug: slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    // Insert blogs
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .insert(blogs)
      .select();
      
    if (error) {
      return NextResponse.json(
        { error: 'Failed to migrate blogs: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: `Successfully migrated ${data.length} blogs to the database`
    });
  } catch (error) {
    console.error('Error migrating blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
} 
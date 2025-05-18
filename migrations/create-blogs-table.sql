-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  read_time TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  content JSONB NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS blogs_author_id_idx ON blogs (author_id);
CREATE INDEX IF NOT EXISTS blogs_slug_idx ON blogs (slug);
CREATE INDEX IF NOT EXISTS blogs_published_idx ON blogs (published);

-- Blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for blog comments
CREATE INDEX IF NOT EXISTS blog_comments_blog_id_idx ON blog_comments (blog_id);

-- Row Level Security for blogs
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Policies for blogs
CREATE POLICY blogs_select_policy ON blogs 
  FOR SELECT 
  USING (published = TRUE OR auth.uid() = author_id);

CREATE POLICY blogs_insert_policy ON blogs 
  FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY blogs_update_policy ON blogs 
  FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY blogs_delete_policy ON blogs 
  FOR DELETE 
  USING (auth.uid() = author_id);

-- Row Level Security for blog comments
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;

-- Policies for blog comments
CREATE POLICY blog_comments_select_policy ON blog_comments 
  FOR SELECT 
  USING (true);

CREATE POLICY blog_comments_insert_policy ON blog_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY blog_comments_update_policy ON blog_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY blog_comments_delete_policy ON blog_comments 
  FOR DELETE 
  USING (auth.uid() = user_id); 
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Create row level security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Only allow users to see and edit their own data
CREATE POLICY users_select_policy ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY users_update_policy ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow the service role to access all data for API operations
CREATE POLICY service_role_policy ON users 
  USING (auth.role() = 'service_role'); 
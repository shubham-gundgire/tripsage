-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trip summaries table
CREATE TABLE IF NOT EXISTS trip_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  place_info JSONB NOT NULL,
  budget_info JSONB NOT NULL,
  itinerary_info JSONB NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  share_url TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS trip_summaries_destination_idx ON trip_summaries (destination);
CREATE INDEX IF NOT EXISTS trip_summaries_user_id_idx ON trip_summaries (user_id);
CREATE INDEX IF NOT EXISTS trip_summaries_share_url_idx ON trip_summaries (share_url);

-- Enable Row Level Security
ALTER TABLE trip_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- Anyone can view a shared trip summary
CREATE POLICY trip_summaries_select_policy ON trip_summaries 
  FOR SELECT 
  USING (true);

-- Only authenticated users can create trip summaries
CREATE POLICY trip_summaries_insert_policy ON trip_summaries 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can only update or delete their own trip summaries
CREATE POLICY trip_summaries_update_policy ON trip_summaries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY trip_summaries_delete_policy ON trip_summaries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow service role to manage all trip summaries
CREATE POLICY trip_summaries_service_policy ON trip_summaries
  USING (auth.role() = 'service_role'); 
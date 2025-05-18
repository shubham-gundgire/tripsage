-- Add share_id column to trip_summaries table
ALTER TABLE trip_summaries ADD COLUMN IF NOT EXISTS share_id TEXT;

-- Create index on share_id for faster queries
CREATE INDEX IF NOT EXISTS trip_summaries_share_id_idx ON trip_summaries (share_id);

-- Update RLS policy to allow accessing trip_summaries by share_id
DROP POLICY IF EXISTS trip_summaries_select_by_share_id ON trip_summaries;
CREATE POLICY trip_summaries_select_by_share_id ON trip_summaries 
  FOR SELECT 
  USING (true);

-- Add comment explaining the purpose of this column
COMMENT ON COLUMN trip_summaries.share_id IS 'Unique identifier used in share URL for accessing trip summaries'; 
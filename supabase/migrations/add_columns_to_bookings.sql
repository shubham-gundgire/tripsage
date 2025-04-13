-- Add hotel_details and travel_details columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hotel_details JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS travel_details JSONB DEFAULT '{}'::jsonb;

-- Create a stored procedure to execute the ALTER TABLE statement
CREATE OR REPLACE FUNCTION public.execute_alter_bookings_table()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Add hotel_details and travel_details columns to bookings table if they don't exist
  ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS hotel_details JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS travel_details JSONB DEFAULT '{}'::jsonb;
  
  result := json_build_object(
    'status', 'success',
    'message', 'Columns added to bookings table successfully',
    'columns_added', array['hotel_details', 'travel_details']
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    result := json_build_object(
      'status', 'error',
      'message', 'Failed to add columns to bookings table',
      'error_message', SQLERRM,
      'error_detail', SQLSTATE
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_alter_bookings_table() TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_alter_bookings_table() TO anon;
GRANT EXECUTE ON FUNCTION public.execute_alter_bookings_table() TO service_role; 
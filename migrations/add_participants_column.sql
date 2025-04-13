-- Add participants column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS participants TEXT;

-- Update existing rows with an empty JSON array
UPDATE bookings SET participants = '[]' WHERE participants IS NULL;

-- Comment: This column is for storing information about the people participating in the booking
-- It can store a JSON array of participant details 
-- Make the guests column nullable to support bookings without guest counts
ALTER TABLE bookings ALTER COLUMN guests DROP NOT NULL;

-- Set a default value for existing NULL guests fields
UPDATE bookings 
SET guests = 1
WHERE guests IS NULL;

-- Comment: The guests column is only required for hotel bookings
-- For other booking types like travel packages, it can be null 
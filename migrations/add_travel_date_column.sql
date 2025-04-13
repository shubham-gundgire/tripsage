-- Add travel_date column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_date DATE;

-- For existing hotel bookings, set travel_date to check_in_date
UPDATE bookings 
SET travel_date = check_in_date::DATE 
WHERE booking_type = 'hotel' AND travel_date IS NULL;

-- Comment: This column is required for all booking types and represents the primary travel date 
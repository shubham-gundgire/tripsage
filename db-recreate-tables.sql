-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- IMPORTANT: Temporarily disable RLS for initial setup
-- Comment out this section after initial data load if needed
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS password_reset_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hotels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS room_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS travel_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- Users table
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

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE IF NOT EXISTS hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  rating DECIMAL(3, 1),
  amenities TEXT[] NOT NULL,
  images TEXT[] NOT NULL,
  room_types TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotel room types
CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  capacity INT NOT NULL,
  amenities TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Travel packages table
CREATE TABLE IF NOT EXISTS travel_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INT NOT NULL,
  includes TEXT[] NOT NULL,
  excludes TEXT[] NOT NULL,
  images TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table for both hotels and travel packages
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('hotel', 'travel')),
  hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
  travel_package_id UUID REFERENCES travel_packages(id) ON DELETE SET NULL,
  check_in_date DATE,
  check_out_date DATE,
  guests INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'confirmed' 
    CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add Row Level Security (RLS) policies to all tables
-- IMPORTANT: Only enable these AFTER initial data loading is complete
-- If you need to load more data later, you can:
-- 1. Use the service role key in your application
-- 2. Temporarily disable RLS again
-- 3. Re-enable RLS after loading data

-- Uncomment this section after initial data loading
/*
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY users_select_policy ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY users_update_policy ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Password reset tokens policies
CREATE POLICY password_reset_tokens_service_policy ON password_reset_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Hotels policies
CREATE POLICY hotels_service_policy ON hotels
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY hotels_select_policy ON hotels
  FOR SELECT
  USING (true);

-- Room types policies
CREATE POLICY room_types_service_policy ON room_types
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY room_types_select_policy ON room_types
  FOR SELECT
  USING (true);

-- Travel packages policies
CREATE POLICY travel_packages_service_policy ON travel_packages
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY travel_packages_select_policy ON travel_packages
  FOR SELECT
  USING (true);

-- Bookings policies
CREATE POLICY bookings_service_policy ON bookings
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY bookings_select_policy ON bookings
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Service role policy for all tables
CREATE POLICY service_role_policy ON users 
  USING (auth.role() = 'service_role'); 
*/ 
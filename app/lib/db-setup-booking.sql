-- Hotels table for storing hotel information
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

-- Hotel room types with pricing
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

-- Add RLS policies
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all tables
CREATE POLICY hotels_service_policy ON hotels
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY room_types_service_policy ON room_types
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY travel_packages_service_policy ON travel_packages
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY bookings_service_policy ON bookings
  FOR ALL
  USING (auth.role() = 'service_role');

-- Allow users to read hotel and travel package data
CREATE POLICY hotels_select_policy ON hotels
  FOR SELECT
  USING (true);

CREATE POLICY room_types_select_policy ON room_types
  FOR SELECT
  USING (true);

CREATE POLICY travel_packages_select_policy ON travel_packages
  FOR SELECT
  USING (true);

-- Allow users to see only their own bookings
CREATE POLICY bookings_select_policy ON bookings
  FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Allow users to insert their own bookings
CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Populate dummy data for hotels
INSERT INTO hotels (name, location, address, description, price_per_night, rating, amenities, images, room_types)
VALUES
  ('Grand Luxe Resort', 'Paris, France', '123 Champs-Élysées, Paris', 'Experience luxury in the heart of Paris with stunning Eiffel Tower views.', 299.99, 4.8, 
   ARRAY['Free Wi-Fi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Bar', '24-Hour Front Desk', 'Room Service'],
   ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070'],
   ARRAY['Standard', 'Deluxe', 'Suite']),
   
  ('Ocean Paradise Hotel', 'Bali, Indonesia', '45 Beach Road, Kuta, Bali', 'A beachfront paradise with pristine white sand beaches and crystal-clear waters.', 199.99, 4.6, 
   ARRAY['Free Wi-Fi', 'Infinity Pool', 'Beach Access', 'Spa', 'Water Sports', 'Restaurant', 'Bar'],
   ARRAY['https://images.unsplash.com/photo-1618245318763-453825cd2de4?q=80&w=2070', 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070'],
   ARRAY['Garden View', 'Ocean View', 'Beach Villa']),
   
  ('Mountain Retreat Lodge', 'Aspen, Colorado', '789 Mountain Pass, Aspen', 'Cozy mountain lodge surrounded by breathtaking alpine scenery.', 249.99, 4.7, 
   ARRAY['Free Wi-Fi', 'Fireplace', 'Hot Tub', 'Ski Storage', 'Restaurant', 'Bar', 'Hiking Trails'],
   ARRAY['https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=2070', 'https://images.unsplash.com/photo-1506974210756-8e1b8985d348?q=80&w=2070'],
   ARRAY['Standard Room', 'Deluxe Room', 'Family Suite']),
   
  ('City Lights Hotel', 'New York, USA', '555 Broadway, New York', 'Modern hotel in the bustling heart of Manhattan, close to all major attractions.', 279.99, 4.5, 
   ARRAY['Free Wi-Fi', 'Fitness Center', 'Business Center', 'Restaurant', 'Bar', 'Room Service'],
   ARRAY['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2070'],
   ARRAY['City View', 'Premium', 'Executive Suite']),
   
  ('Desert Oasis Resort', 'Dubai, UAE', '123 Palm Jumeirah, Dubai', 'Luxury desert resort with private pools and stunning sand dune views.', 399.99, 4.9, 
   ARRAY['Free Wi-Fi', 'Private Pool', 'Spa', 'Desert Safari', 'Multiple Restaurants', 'Bar', 'Butler Service'],
   ARRAY['https://images.unsplash.com/photo-1580977276076-ae4b8c219b8e?q=80&w=2070', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070'],
   ARRAY['Desert View', 'Oasis Suite', 'Royal Villa']),
   
  ('Tropical Haven Resort', 'Phuket, Thailand', '42 Patong Beach Road, Phuket', 'Tropical paradise surrounded by lush gardens and beautiful beaches.', 159.99, 4.4, 
   ARRAY['Free Wi-Fi', 'Swimming Pool', 'Beach Access', 'Spa', 'Restaurant', 'Bar', 'Airport Shuttle'],
   ARRAY['https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?q=80&w=2070', 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2070'],
   ARRAY['Garden Room', 'Pool Access', 'Beachfront Villa']);

-- Populate room types for each hotel
INSERT INTO room_types (hotel_id, name, description, price_per_night, capacity, amenities)
SELECT 
  id,
  'Standard Room',
  'Comfortable room with essential amenities for a pleasant stay.',
  price_per_night,
  2,
  ARRAY['King Bed', 'Air Conditioning', 'TV', 'Safe', 'Mini Fridge']
FROM hotels
UNION ALL
SELECT 
  id,
  'Deluxe Room',
  'Spacious room with additional amenities and better views.',
  price_per_night * 1.5,
  2,
  ARRAY['King Bed', 'Air Conditioning', 'TV', 'Safe', 'Mini Fridge', 'Balcony', 'Sitting Area']
FROM hotels
UNION ALL
SELECT 
  id,
  'Suite',
  'Luxurious suite with separate living area and premium amenities.',
  price_per_night * 2.5,
  4,
  ARRAY['King Bed', 'Air Conditioning', 'TV', 'Safe', 'Mini Bar', 'Balcony', 'Living Room', 'Jacuzzi']
FROM hotels;

-- Populate dummy data for travel packages
INSERT INTO travel_packages (name, destination, description, price, duration_days, includes, excludes, images)
VALUES
  ('Romantic Paris Getaway', 'Paris, France', 'Experience the magic of Paris with your loved one, including Eiffel Tower visit, Seine River cruise, and wine tasting.', 1299.99, 5, 
   ARRAY['Round-trip flights', '4 nights in 4-star hotel', 'Daily breakfast', 'Seine River dinner cruise', 'Eiffel Tower visit', 'Louvre Museum tour', 'Wine tasting experience'],
   ARRAY['Travel insurance', 'Personal expenses', 'Additional meals', 'Optional activities'],
   ARRAY['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073', 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2007']),
   
  ('Bali Beach Paradise', 'Bali, Indonesia', 'Relax on pristine beaches, explore ancient temples, and immerse yourself in Balinese culture.', 1499.99, 7, 
   ARRAY['Round-trip flights', '6 nights in beach resort', 'Daily breakfast', 'Airport transfers', 'Ubud tour', 'Temple visits', 'Balinese cooking class', 'Spa treatment'],
   ARRAY['Travel insurance', 'Personal expenses', 'Additional meals', 'Optional activities'],
   ARRAY['https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2038', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=2070']),
   
  ('New York City Explorer', 'New York, USA', 'Discover the Big Apple with visits to iconic landmarks, Broadway shows, and shopping.', 1899.99, 6, 
   ARRAY['Round-trip flights', '5 nights in Manhattan hotel', 'City pass for attractions', 'Statue of Liberty tour', 'Broadway show tickets', 'Museum admissions', 'Shopping tour'],
   ARRAY['Travel insurance', 'Personal expenses', 'Meals', 'Optional activities'],
   ARRAY['https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070']),
   
  ('Dubai Luxury Experience', 'Dubai, UAE', 'Experience the opulence of Dubai with desert safaris, world-class shopping, and futuristic attractions.', 2499.99, 7, 
   ARRAY['Round-trip flights', '6 nights in 5-star hotel', 'Daily breakfast', 'Desert safari with dinner', 'Burj Khalifa tour', 'Dubai Mall VIP shopping experience', 'Yacht cruise'],
   ARRAY['Travel insurance', 'Personal expenses', 'Additional meals', 'Optional activities'],
   ARRAY['https://images.unsplash.com/photo-1548837102-09bd19427514?q=80&w=2070', 'https://images.unsplash.com/photo-1582672112031-fa720659e8e5?q=80&w=2070']),
   
  ('Thailand Adventure', 'Thailand', 'Explore the diverse landscapes and cultures of Thailand from bustling Bangkok to serene beaches.', 1699.99, 10, 
   ARRAY['Round-trip flights', '9 nights accommodation', 'Daily breakfast', 'Island hopping tour', 'Temple visits', 'Thai cooking class', 'Elephant sanctuary visit', 'Bangkok city tour'],
   ARRAY['Travel insurance', 'Personal expenses', 'Additional meals', 'Optional activities'],
   ARRAY['https://images.unsplash.com/photo-1554481923-a6918bd997bc?q=80&w=2069', 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2073']); 
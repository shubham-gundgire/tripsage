/**
 * This file contains seed data functions for generating test bookings.
 * These functions can be used in an API route or database migration.
 */

import { createClient } from '@supabase/supabase-js';

// Create the Supabase client
const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Create sample hotel bookings for a user
 */
export async function createSampleHotelBookings(userId) {
  if (!userId) throw new Error('User ID is required');
  
  const supabase = createAdminClient();
  
  // Get random hotel and room type
  const { data: hotels } = await supabase
    .from('hotels')
    .select('id, name')
    .limit(3);
    
  if (!hotels || hotels.length === 0) {
    throw new Error('No hotels found in the database');
  }
  
  // Create sample bookings (one confirmed, one completed, one cancelled)
  const sampleBookings = [
    // Confirmed upcoming booking
    {
      user_id: userId,
      booking_type: 'hotel',
      hotel_id: hotels[0].id,
      room_type_id: null, // Will be set after fetching room types
      check_in_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      check_out_date: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 33 days from now
      guests: 2,
      total_price: 899.97, // Will be calculated
      booking_status: 'confirmed',
      special_requests: 'We would like a room with a city view if possible.'
    },
    // Completed past booking
    {
      user_id: userId,
      booking_type: 'hotel',
      hotel_id: hotels[1].id,
      room_type_id: null, // Will be set after fetching room types
      check_in_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days ago
      check_out_date: new Date(Date.now() - 57 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 57 days ago
      guests: 3,
      total_price: 749.97, // Will be calculated
      booking_status: 'completed',
      special_requests: 'We need extra towels and toiletries.'
    },
    // Cancelled booking
    {
      user_id: userId,
      booking_type: 'hotel',
      hotel_id: hotels[2].id,
      room_type_id: null, // Will be set after fetching room types
      check_in_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      check_out_date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 27 days ago
      guests: 1,
      total_price: 599.97, // Will be calculated
      booking_status: 'cancelled',
      special_requests: ''
    }
  ];
  
  // For each booking, get a room type and calculate total price
  for (const booking of sampleBookings) {
    // Get a room type for the hotel
    const { data: roomTypes } = await supabase
      .from('room_types')
      .select('id, price_per_night')
      .eq('hotel_id', booking.hotel_id)
      .limit(1);
      
    if (!roomTypes || roomTypes.length === 0) {
      console.warn(`No room types found for hotel ${booking.hotel_id}`);
      continue;
    }
    
    booking.room_type_id = roomTypes[0].id;
    
    // Calculate total price based on check-in and check-out dates
    const checkInDate = new Date(booking.check_in_date);
    const checkOutDate = new Date(booking.check_out_date);
    const nights = Math.ceil((checkOutDate - checkInDate) / (24 * 60 * 60 * 1000));
    
    booking.total_price = roomTypes[0].price_per_night * nights;
  }
  
  // Insert the bookings
  const { data, error } = await supabase
    .from('bookings')
    .insert(sampleBookings)
    .select();
    
  if (error) {
    throw new Error(`Error creating sample hotel bookings: ${error.message}`);
  }
  
  return data;
}

/**
 * Create sample travel package bookings for a user
 */
export async function createSampleTravelBookings(userId) {
  if (!userId) throw new Error('User ID is required');
  
  const supabase = createAdminClient();
  
  // Get random travel packages
  const { data: packages } = await supabase
    .from('travel_packages')
    .select('id, price')
    .limit(2);
    
  if (!packages || packages.length === 0) {
    throw new Error('No travel packages found in the database');
  }
  
  // Create sample bookings (one confirmed, one pending)
  const sampleBookings = [
    // Confirmed upcoming booking
    {
      user_id: userId,
      booking_type: 'travel',
      travel_package_id: packages[0].id,
      travel_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
      guests: 2,
      total_price: packages[0].price * 2,
      booking_status: 'confirmed',
      special_requests: 'We would like a vegetarian meal option.'
    },
    // Pending booking
    {
      user_id: userId,
      booking_type: 'travel',
      travel_package_id: packages[1].id,
      travel_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      guests: 3,
      total_price: packages[1].price * 3,
      booking_status: 'pending',
      special_requests: 'We need assistance with transportation from the airport.'
    }
  ];
  
  // Insert the bookings
  const { data, error } = await supabase
    .from('bookings')
    .insert(sampleBookings)
    .select();
    
  if (error) {
    throw new Error(`Error creating sample travel bookings: ${error.message}`);
  }
  
  return data;
}

/**
 * Create all sample bookings for a user
 */
export async function createAllSampleBookings(userId) {
  try {
    const hotelBookings = await createSampleHotelBookings(userId);
    const travelBookings = await createSampleTravelBookings(userId);
    
    return {
      hotelBookings,
      travelBookings
    };
  } catch (error) {
    console.error('Error creating sample bookings:', error);
    throw error;
  }
} 
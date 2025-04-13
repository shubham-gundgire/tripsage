import supabase from '@/app/lib/supabase';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(request) {
  console.log('⬇️ Starting user-bookings API request');
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No Bearer token in authorization header');
      return NextResponse.json(
        { error: 'Unauthorized: No valid token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    console.log('🔑 Token retrieved from header');
    
    // Verify and decode the JWT token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token verified successfully');
    } catch (err) {
      console.error('❌ Invalid token:', err.message);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user ID from decoded token
    const userId = decodedToken.userId;
    console.log('👤 User ID from token:', userId);

    // Fetch all bookings for the user using Supabase directly (not auth)
    console.log('📚 Fetching bookings for user:', userId);
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id (*),
        room_types:room_type_id (*),
        travel_packages:travel_package_id (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user bookings:', error.message);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched ${bookings.length} bookings`);

    // Process bookings to add necessary details for the frontend
    const processedBookings = bookings.map(booking => {
      // For hotel bookings, check if it uses the new hotel_details field
      if (booking.booking_type === 'hotel') {
        if (booking.hotel_details) {
          try {
            // Parse hotel_details JSON string
            const hotelDetails = JSON.parse(booking.hotel_details);
            
            // Set properties from the JSON
            booking.name = hotelDetails.hotel_name;
            booking.location = hotelDetails.hotel_location;
            booking.room_name = hotelDetails.room_type;
            
            // Set default image if not available
            booking.image = null;
          } catch (err) {
            console.error('Error parsing hotel_details:', err);
            booking.name = 'Unknown Hotel';
            booking.location = 'Unknown Location';
            booking.image = null;
          }
        }
        // Legacy format - using foreign keys
        else if (booking.hotels) {
          booking.name = booking.hotels.name;
          booking.location = booking.hotels.location;
          booking.image = booking.hotels.images?.[0] || null;
          
          if (booking.room_types) {
            booking.room_name = booking.room_types.name;
            booking.price_per_night = booking.room_types.price_per_night;
          }
        }
        // Fallback for incomplete data
        else {
          booking.name = 'Hotel Booking';
          booking.location = 'Location not available';
          booking.image = null;
        }
      } 
      // For travel package bookings, check if it uses the new travel_details field
      else if (booking.booking_type === 'travel') {
        if (booking.travel_details) {
          try {
            // Parse travel_details JSON string
            const travelDetails = JSON.parse(booking.travel_details);
            
            // Set properties from the JSON
            booking.name = travelDetails.package_name;
            booking.location = travelDetails.destination;
            booking.duration = travelDetails.duration;
            
            // Set default image if not available
            booking.image = null;
          } catch (err) {
            console.error('Error parsing travel_details:', err);
            booking.name = 'Unknown Travel Package';
            booking.location = 'Unknown Destination';
            booking.image = null;
          }
        }
        // Legacy format - using foreign keys
        else if (booking.travel_packages) {
          booking.name = booking.travel_packages.name;
          booking.location = booking.travel_packages.destination;
          booking.image = booking.travel_packages.images?.[0] || null;
          booking.duration = booking.travel_packages.duration;
        }
        // Fallback for incomplete data
        else {
          booking.name = 'Travel Package';
          booking.location = 'Destination not available';
          booking.image = null;
        }
      }
      
      return booking;
    });

    return NextResponse.json({ bookings: processedBookings });
  } catch (error) {
    console.error('❌ Unexpected error in user bookings API:', error.message);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
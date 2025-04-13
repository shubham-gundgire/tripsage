import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';
import supabase from '@/app/lib/supabase';

export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Get user ID from authenticated request
    const userId = auth.user.userId;
    
    // Parse the request body
    const bookingData = await request.json();
    
    // Validate required fields
    if (!bookingData.check_in_date || !bookingData.check_out_date || 
        !bookingData.guests || !bookingData.total_price) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }
    
    // Store hotel details as JSON instead of a foreign key reference
    const hotelDetails = bookingData.hotel_details || {
      hotel_id: bookingData.hotel_id,
      hotel_name: bookingData.hotel_name || 'Unknown Hotel',
      hotel_location: bookingData.hotel_location || 'Unknown Location',
      room_type: bookingData.room_type_id || bookingData.room_type || 'Standard Room'
    };
    
    // Prepare the booking data with user ID
    const newBooking = {
      user_id: userId,
      booking_type: 'hotel',
      // Store detailed hotel information as JSON
      hotel_details: JSON.stringify(hotelDetails),
      check_in_date: bookingData.check_in_date,
      check_out_date: bookingData.check_out_date,
      travel_date: bookingData.check_in_date,
      guests: bookingData.guests,
      participants: JSON.stringify([]), // Add empty participants array
      total_price: bookingData.total_price,
      booking_status: 'confirmed',
      special_requests: bookingData.special_requests || '',
      created_at: new Date().toISOString()
    };
    
    console.log('Creating hotel booking:', newBooking);
    
    // Insert the booking using standard supabase client
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select();
    
    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json(
        { error: 'Failed to create booking: ' + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Booking created successfully',
      booking: data[0]
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
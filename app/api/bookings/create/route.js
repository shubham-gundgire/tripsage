import supabase from '@/app/lib/supabase';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function POST(request) {
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
    
    // Parse the request body
    const bookingData = await request.json();
    
    // Basic validation based on booking type
    if (!bookingData.booking_type || !['hotel', 'travel'].includes(bookingData.booking_type)) {
      return NextResponse.json(
        { error: 'Invalid booking type' },
        { status: 400 }
      );
    }
    
    // Prepare the booking data with user ID
    const newBooking = {
      user_id: userId,
      booking_type: bookingData.booking_type,
      booking_status: bookingData.booking_status || 'confirmed',
      total_price: bookingData.total_price,
      special_requests: bookingData.special_requests || '',
      ...( bookingData.booking_type === 'hotel' ? {
        hotel_id: bookingData.hotel_id,
        room_type_id: bookingData.room_type_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        guests: bookingData.guests
      } : {
        travel_package_id: bookingData.travel_package_id,
        travel_date: bookingData.travel_date,
        participants: bookingData.participants
      })
    };
    
    // Insert the new booking into the database
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error.message);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Booking created successfully',
      booking: data
    });
  } catch (error) {
    console.error('Unexpected error in create booking API:', error.message);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
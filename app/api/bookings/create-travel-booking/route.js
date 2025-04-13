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
    if (!bookingData.travel_date || !bookingData.participants || !bookingData.total_price) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      );
    }
    
    // Store travel package details as JSON instead of a foreign key reference
    const travelDetails = {
      travel_package_id: bookingData.travel_package_id,
      package_name: bookingData.package_name || 'Unknown Package',
      destination: bookingData.destination || 'Unknown Destination',
      duration: bookingData.duration || 'N/A',
      package_type: bookingData.package_type || 'Standard Package'
    };
    
    // Prepare the booking data with user ID
    const newBooking = {
      user_id: userId,
      booking_type: 'travel',
      // Store travel details as JSON string instead of using foreign keys
      travel_details: JSON.stringify(travelDetails),
      travel_date: bookingData.travel_date,
      participants: bookingData.participants,
      guests: bookingData.guests || 1,
      total_price: bookingData.total_price,
      booking_status: 'confirmed',
      special_requests: bookingData.special_requests || '',
      created_at: new Date().toISOString()
    };
    
    console.log('Creating travel booking:', newBooking);
    
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
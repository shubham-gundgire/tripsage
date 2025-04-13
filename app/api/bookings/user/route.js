import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';
import { authenticateRequest } from '@/app/lib/auth';

export async function GET(request) {
  // Authenticate request
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    // Fetch user's bookings with related data
    const { data: hotelBookings, error: hotelError } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id (*),
        room_types:room_type_id (*)
      `)
      .eq('user_id', auth.user.userId)
      .eq('booking_type', 'hotel');

    if (hotelError) {
      console.error('Error fetching hotel bookings:', hotelError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    const { data: travelBookings, error: travelError } = await supabase
      .from('bookings')
      .select(`
        *,
        travel_packages:travel_package_id (*)
      `)
      .eq('user_id', auth.user.userId)
      .eq('booking_type', 'travel');

    if (travelError) {
      console.error('Error fetching travel bookings:', travelError);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Combine all bookings
    const allBookings = [...(hotelBookings || []), ...(travelBookings || [])];

    // Sort by creation date (newest first)
    allBookings.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return NextResponse.json({
      bookings: allBookings
    });
  } catch (error) {
    console.error('Error in user bookings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAllSampleBookings } from '../../../lib/booking-seed-data';

export async function POST(request) {
  // Create supabase client with function for cookies
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({
    cookies: () => cookieStore
  });

  try {
    // Check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user ID from session
    const userId = session.user.id;

    // Check if this is a development environment
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Generate sample bookings
    const sampleBookings = await createAllSampleBookings(userId);

    return NextResponse.json({ 
      message: 'Sample bookings created successfully',
      bookings: sampleBookings
    });
  } catch (error) {
    console.error('Error creating sample bookings:', error.message);
    return NextResponse.json(
      { error: 'Failed to create sample bookings: ' + error.message },
      { status: 500 }
    );
  }
} 
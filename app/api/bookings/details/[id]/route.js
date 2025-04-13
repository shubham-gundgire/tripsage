import supabase from '@/app/lib/supabase';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export async function GET(request, { params }) {
  const { id } = params;
  
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

    // Fetch booking with related data
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        hotels:hotel_id (*),
        room_types:room_type_id (*),
        travel_packages:travel_package_id (*)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching booking details:', error.message);
      return NextResponse.json(
        { error: 'Booking not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 
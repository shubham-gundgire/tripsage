import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';

export async function GET(request) {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const duration = searchParams.get('duration');

    // Build query
    let query = supabase.from('travel_packages').select('*');

    // Apply filters if provided
    if (destination) {
      query = query.ilike('destination', `%${destination}%`);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (duration) {
      query = query.eq('duration_days', parseInt(duration));
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching travel packages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch travel packages' },
        { status: 500 }
      );
    }

    return NextResponse.json({ packages: data });
  } catch (error) {
    console.error('Error in travel packages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';

export async function GET(request, { params }) {
  try {
    // Properly handle params, ensuring id is defined
    if (!params || !params.id) {
      return NextResponse.json(
        { error: 'Trip summary ID is required' },
        { status: 400 }
      );
    }
    
    const id = params.id;
    console.log('Fetching trip summary with ID:', id);

    // Fetch the trip summary from the database - first try by ID
    let { data, error } = await supabase
      .from('trip_summaries')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no record is found

    // If not found by ID, try by share_id
    if (!data && !error) {
      console.log('Trip summary not found by ID, trying share_id');
      const { data: shareData, error: shareError } = await supabase
        .from('trip_summaries')
        .select('*')
        .eq('share_id', id)
        .maybeSingle();
      
      data = shareData;
      error = shareError;
    }

    if (error) {
      console.error('Error fetching trip summary:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trip summary', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.log('Trip summary not found for ID:', id);
      return NextResponse.json(
        { error: 'Trip summary not found' },
        { status: 404 }
      );
    }

    console.log('Successfully retrieved trip summary');
    
    // Return the trip summary data
    return NextResponse.json({
      success: true,
      summary: data
    });
  } catch (error) {
    console.error('Trip summary fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 
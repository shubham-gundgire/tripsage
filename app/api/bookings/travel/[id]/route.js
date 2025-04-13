import { NextResponse } from 'next/server';
import supabase from '@/app/lib/supabase';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Travel package ID is required' },
        { status: 400 }
      );
    }

    // Fetch travel package details
    const { data: travelPackage, error } = await supabase
      .from('travel_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching travel package:', error);
      return NextResponse.json(
        { error: 'Failed to fetch travel package details' },
        { status: 500 }
      );
    }

    if (!travelPackage) {
      return NextResponse.json(
        { error: 'Travel package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ package: travelPackage });
  } catch (error) {
    console.error('Error in travel package details API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
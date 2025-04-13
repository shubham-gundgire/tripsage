import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';

export async function POST(request) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request);
    if (!auth.authenticated) {
      return auth.response;
    }

    // Parse the request body
    const { id, name, destination } = await request.json();

    // Validate inputs
    if (!id) {
      return NextResponse.json(
        { error: 'Travel package ID is required' },
        { status: 400 }
      );
    }

    console.log('Looking up travel package details for:', { id, name, destination });

    // Since we're using client-side generated data from the LLM search, 
    // we'll need to get the cached travel package data from the localStorage on the client.
    // Here, we just need to indicate that this might be fallback data.
    
    return NextResponse.json({
      is_fallback_data: true,
      travelPackage: null // This will be filled on the client side
    });
  } catch (error) {
    console.error('Travel package details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
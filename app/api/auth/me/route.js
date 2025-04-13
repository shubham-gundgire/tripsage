import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/app/lib/auth';
import supabase from '@/app/lib/supabase';

export async function GET(request) {
  // Authenticate request
  const auth = await authenticateRequest(request);
  if (!auth.authenticated) {
    return auth.response;
  }

  try {
    // Get user data from database
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', auth.user.userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('User profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
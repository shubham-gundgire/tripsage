import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🔍 Auth status check starting');
  
  try {
    // Log environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log('Environment variables present:', {
      'NEXT_PUBLIC_SUPABASE_URL': !!supabaseUrl,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!supabaseKey,
    });
    
    // Get cookies
    console.log('Getting cookies...');
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log(`Found ${allCookies.length} cookies`);
    console.log('Cookie names:', allCookies.map(c => c.name));
    
    // Find auth cookie
    const authCookie = allCookies.find(c => c.name.includes('auth-token'));
    if (authCookie) {
      console.log('Auth cookie found:', authCookie.name);
    } else {
      console.log('No auth cookie found');
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    });
    
    // Get session
    console.log('Getting auth session...');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error.message);
      return NextResponse.json({
        status: 'error',
        error: error.message,
        cookies: {
          total: allCookies.length,
          names: allCookies.map(c => c.name),
          hasAuthCookie: !!authCookie
        }
      }, { status: 500 });
    }
    
    if (!data.session) {
      console.log('No active session found');
      return NextResponse.json({
        status: 'unauthenticated',
        cookies: {
          total: allCookies.length,
          names: allCookies.map(c => c.name),
          hasAuthCookie: !!authCookie
        }
      });
    }
    
    // Return session info
    console.log('Session found for user:', data.session.user.email);
    return NextResponse.json({
      status: 'authenticated',
      user: {
        id: data.session.user.id,
        email: data.session.user.email
      },
      cookies: {
        total: allCookies.length,
        names: allCookies.map(c => c.name),
        hasAuthCookie: !!authCookie
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 
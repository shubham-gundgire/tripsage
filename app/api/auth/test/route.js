import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('⬇️ Starting auth test route');
  
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔑 Supabase URL exists:', !!supabaseUrl);
    console.log('🔑 Supabase Anon Key exists:', !!supabaseAnonKey);
    
    // Access cookies
    console.log('📦 Accessing cookies store');
    const cookieStore = await cookies();
    console.log('🍪 Cookie store accessed');
    
    // Debug: Log available cookies
    const allCookies = cookieStore.getAll();
    console.log('🍪 Available cookies:', allCookies.map(c => c.name));
    
    // Extract auth cookie if it exists
    const authCookie = allCookies.find(c => c.name.includes('-auth-token'));
    console.log('🔐 Auth cookie found:', !!authCookie);
    
    if (authCookie) {
      console.log('🔐 Auth cookie name:', authCookie.name);
      // Don't log the full value for security reasons
      console.log('🔐 Auth cookie value (truncated):', 
        authCookie.value.substring(0, 10) + '...' + 
        authCookie.value.substring(authCookie.value.length - 10));
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    });
    console.log('🔌 Supabase client created');
    
    // Check authentication
    console.log('🔐 Checking authentication session');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
      return NextResponse.json(
        { 
          error: sessionError.message,
          cookiesFound: allCookies.length,
          authCookieFound: !!authCookie
        },
        { status: 401 }
      );
    }
    
    if (!sessionData?.session) {
      console.error('❌ No session found - unauthorized');
      return NextResponse.json(
        { 
          error: 'No session found',
          cookiesFound: allCookies.length,
          authCookieFound: !!authCookie
        },
        { status: 401 }
      );
    }
    
    const user = sessionData.session.user;
    console.log('👤 User authenticated:', user.email);
    
    return NextResponse.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        email: user.email,
        lastSignIn: user.last_sign_in_at
      },
      cookiesFound: allCookies.length
    });
    
  } catch (error) {
    console.error('❌ Error in auth test route:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Unexpected error: ' + error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('🍪 Debug cookies route starting');
  
  const result = {
    methods: {},
    environment: {},
    errors: []
  };
  
  try {
    // Check environment
    result.environment = {
      nodeEnv: process.env.NODE_ENV,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
    
    // Method 1: Standard cookies() approach
    try {
      console.log('Method 1: Using cookies()');
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      
      result.methods.method1 = {
        success: true,
        cookieCount: allCookies.length,
        cookieNames: allCookies.map(c => c.name)
      };
      
      // Try to get specific auth cookie
      const authCookie = allCookies.find(c => c.name.includes('-auth-token'));
      result.methods.method1.authCookieFound = !!authCookie;
      if (authCookie) {
        result.methods.method1.authCookieName = authCookie.name;
      }
    } catch (error) {
      result.methods.method1 = {
        success: false,
        error: error.message
      };
      result.errors.push(`Method 1 failed: ${error.message}`);
    }
    
    // Method 2: Try direct cookie access
    try {
      console.log('Method 2: Using cookies() with specific cookie name');
      const cookieStore = await cookies();
      const specificCookie = cookieStore.get('sb-lhahkzopivqnqlnkjpsv-auth-token');
      
      result.methods.method2 = {
        success: true,
        cookieFound: !!specificCookie
      };
      
      if (specificCookie) {
        result.methods.method2.cookieName = specificCookie.name;
        // Only log a small part of value for security
        result.methods.method2.cookieValueStart = specificCookie.value.substring(0, 10) + '...';
      }
    } catch (error) {
      result.methods.method2 = {
        success: false,
        error: error.message
      };
      result.errors.push(`Method 2 failed: ${error.message}`);
    }
    
    // Method 3: Try to create Supabase client
    try {
      console.log('Method 3: Creating Supabase client');
      const cookieStore = await cookies();
      const supabase = createRouteHandlerClient({
        cookies: () => cookieStore
      });
      
      result.methods.method3 = {
        success: true,
        clientCreated: !!supabase
      };
      
      // Check if we can get session
      try {
        const { data, error } = await supabase.auth.getSession();
        result.methods.method3.sessionCheck = {
          success: !error,
          hasSession: !!data?.session
        };
        
        if (error) {
          result.methods.method3.sessionCheck.error = error.message;
        }
        
        if (data?.session) {
          result.methods.method3.sessionCheck.userId = data.session.user.id;
          result.methods.method3.sessionCheck.userEmail = data.session.user.email;
        }
      } catch (sessionError) {
        result.methods.method3.sessionCheck = {
          success: false,
          error: sessionError.message
        };
      }
    } catch (error) {
      result.methods.method3 = {
        success: false,
        error: error.message
      };
      result.errors.push(`Method 3 failed: ${error.message}`);
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Major error in debug route:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Call the stored procedure to alter the bookings table
    const { data, error } = await supabase.rpc('execute_alter_bookings_table')
    
    if (error) {
      console.error('Error executing stored procedure:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to alter bookings table', 
          error: error.message 
        }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Bookings table altered successfully', 
        data 
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Unexpected error occurred', 
        error: error.message 
      }, 
      { status: 500 }
    )
  }
} 
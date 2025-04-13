/**
 * This file creates a Supabase client using the service role key.
 * IMPORTANT: Only use this for admin operations or server-side scripts!
 * NEVER expose your service role key to the client/browser.
 */

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key
// This bypasses RLS policies and can be used for admin operations
const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Supabase URL exists:', !!supabaseUrl);
  console.log('Supabase Service Key exists:', !!supabaseServiceKey);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Environment variables check:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Present' : 'Missing');
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
    console.error('Check your .env.local file to ensure both variables are set correctly');
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

// Example usage:
// 
// import { createAdminClient } from './supabase-service-client';
//
// export async function adminOperation() {
//   const supabaseAdmin = createAdminClient();
//   
//   // This operation will bypass RLS
//   const { data, error } = await supabaseAdmin
//     .from('users')
//     .insert({ name: 'Admin User', email: 'admin@example.com' });
//     
//   // Always handle errors
//   if (error) throw error;
//   
//   return data;
// }

export { createAdminClient }; 
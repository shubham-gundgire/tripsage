import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import supabase from '@/app/lib/supabase';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const { data, error } = await supabase.from('users').insert([
      {
        name,
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Return user data (excluding password)
    const user = data[0];
    delete user.password;

    return NextResponse.json({ 
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
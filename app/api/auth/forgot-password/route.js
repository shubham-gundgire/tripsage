import { NextResponse } from 'next/server';
import crypto from 'crypto';
import supabase from '@/app/lib/supabase';
import { sendPasswordResetEmail } from '@/app/lib/email';

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Error finding user:', error);
      return NextResponse.json(
        { error: 'An error occurred while processing your request' },
        { status: 500 }
      );
    }

    // Always return success even if user doesn't exist (for security)
    if (!users || users.length === 0) {
      return NextResponse.json({
        message: 'If your email is registered, you will receive a password reset link shortly.'
      });
    }

    const user = users[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration time (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Store token in database
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        }
      ]);

    if (tokenError) {
      console.error('Error creating reset token:', tokenError);
      return NextResponse.json(
        { error: 'An error occurred while processing your request' },
        { status: 500 }
      );
    }

    // Send reset email
    try {
      await sendPasswordResetEmail(
        user.email,
        user.name,
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      );
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      // Don't return an error to the client for security reasons
    }

    return NextResponse.json({
      message: 'If your email is registered, you will receive a password reset link shortly.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
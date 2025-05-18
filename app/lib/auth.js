import jwt from 'jsonwebtoken';
import supabase from './supabase';
import { NextResponse } from 'next/server';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in your .env.local file for production');
}

export function getJwtSecretKey() {
  return JWT_SECRET;
}

// Get authenticated user from request headers
export async function getAuthUser(request) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return null;
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded || !decoded.userId) {
      return null;
    }
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', decoded.userId)
      .single();
      
    if (error || !user) {
      return null;
    }
    
    return {
      userId: user.id,
      name: user.name,
      email: user.email
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// Get cookie from request
export function getCookie(request, name) {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const match = cookies.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authenticateRequest(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        authenticated: false, 
        response: NextResponse.json(
          { error: 'Authentication required' }, 
          { status: 401 }
        ) 
      };
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return { 
        authenticated: false, 
        response: NextResponse.json(
          { error: 'Invalid or expired token' }, 
          { status: 401 }
        ) 
      };
    }

    return { 
      authenticated: true, 
      user: decoded 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { 
      authenticated: false, 
      response: NextResponse.json(
        { error: 'Authentication error' }, 
        { status: 500 }
      ) 
    };
  }
} 
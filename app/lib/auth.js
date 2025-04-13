import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in your .env.local file for production');
}

export function getJwtSecretKey() {
  return JWT_SECRET;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getJwtSecretKey());
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
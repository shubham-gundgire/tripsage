'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    // Get token from URL query param
    const tokenParam = searchParams?.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setSuccess(data.message || 'Your password has been reset successfully.');
      setResetComplete(true);
      
      // Clear the form
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (resetComplete) {
    return (
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
        <FaCheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-3xl font-extrabold text-gray-900 font-russo">
          Password Reset Complete
        </h2>
        <p className="mt-2 text-base text-gray-600">
          Your password has been reset successfully. You can now log in with your new password.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="w-full inline-flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-russo">
          Reset Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Create a new password for your account
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading || !token}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <Link 
          href="/login" 
          className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <FaArrowLeft className="h-3 w-3" />
          Back to Login
        </Link>
      </div>
    </div>
  );
} 
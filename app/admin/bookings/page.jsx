'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminBookingsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access this page.</p>
          <Link 
            href="/login" 
            className="w-full block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  const generateTestData = async () => {
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/bookings/seed', {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test data');
      }

      setResult(data);
    } catch (err) {
      console.error('Error generating test data:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Admin</h1>
            <p className="text-gray-600 mb-6">
              Generate test booking data for development and testing purposes.
            </p>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Test data generated successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Created {result.bookings.hotelBookings?.length || 0} hotel bookings and {result.bookings.travelBookings?.length || 0} travel bookings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={generateTestData}
              disabled={isGenerating}
              className={`w-full px-4 py-2 rounded-lg text-white ${
                isGenerating 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } transition-colors flex items-center justify-center`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                'Generate Test Booking Data'
              )}
            </button>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What this does</h2>
              <p className="text-gray-600 mb-4">
                This will create sample hotel and travel package bookings for your account. These bookings will include:
              </p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1 mb-4">
                <li>Confirmed hotel booking (upcoming)</li>
                <li>Completed hotel booking (past)</li>
                <li>Cancelled hotel booking</li>
                <li>Confirmed travel package booking</li>
                <li>Pending travel package booking</li>
              </ul>
              <p className="text-gray-600 text-sm italic">
                Note: This feature is only available in development environments.
              </p>
            </div>

            <div className="mt-8 flex justify-between">
              <Link 
                href="/bookings/my-bookings" 
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                View My Bookings
              </Link>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
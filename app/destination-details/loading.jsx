'use client';
import { FaSpinner } from 'react-icons/fa';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading destination information...</h2>
        <p className="text-gray-500 mt-2">We're gathering the best travel details for you</p>
      </div>
    </div>
  );
} 
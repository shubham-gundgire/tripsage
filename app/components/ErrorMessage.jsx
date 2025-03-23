'use client';
import { FaExclamationTriangle, FaRedoAlt } from 'react-icons/fa';

export default function ErrorMessage({ message, retry }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationTriangle className="text-red-500 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h2>
        <p className="text-gray-600 mb-6">{message || 'An error occurred while loading the data.'}</p>
        
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-300 inline-flex items-center"
          >
            <FaRedoAlt className="mr-2" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { FaHotel, FaPlane, FaHistory, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function BookingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  useEffect(() => {
    // After loading, if not authenticated, show warning
    if (!loading && !isAuthenticated) {
      setShowAuthWarning(true);
    }
  }, [isAuthenticated, loading]);

  const handleOptionClick = (path) => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-russo text-gray-900 mb-3">TripSage Bookings</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Reserve your dream hotel or exciting travel package. Experience luxury stays and memorable adventures around the world.
          </p>
        </div>

        {/* Authentication Warning */}
        {showAuthWarning && (
          <div className="max-w-3xl mx-auto mb-12 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You need to be logged in to make bookings. 
                  <Link href="/login" className="font-medium underline ml-1">
                    Log in
                  </Link> or 
                  <Link href="/signup" className="font-medium underline ml-1">
                    create an account
                  </Link> to continue.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Options */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hotel Bookings */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl"
            onClick={() => handleOptionClick('/bookings/hotel')}
          >
            <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <FaHotel className="text-white text-7xl" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hotel Bookings</h3>
              <p className="text-gray-600 mb-4">
                Find and book your perfect stay from our curated selection of premium hotels worldwide.
              </p>
              <button 
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg ${
                  isAuthenticated 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-600'
                } transition-colors`}
              >
                <span>Browse Hotels</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>

          {/* Travel Package Bookings */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl"
            onClick={() => handleOptionClick('/bookings/travel')}
          >
            <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <FaPlane className="text-white text-7xl" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Travel Packages</h3>
              <p className="text-gray-600 mb-4">
                Book complete travel experiences with flights, accommodations, and unique activities included.
              </p>
              <button 
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg ${
                  isAuthenticated 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-200 text-gray-600'
                } transition-colors`}
              >
                <span>Explore Packages</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>

          {/* My Bookings */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl"
            onClick={() => handleOptionClick('/bookings/my-bookings')}
          >
            <div className="h-48 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
              <FaHistory className="text-white text-7xl" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">My Bookings</h3>
              <p className="text-gray-600 mb-4">
                View and manage all your current and past hotel and travel package bookings.
              </p>
              <button 
                className={`flex items-center justify-between w-full px-4 py-2 rounded-lg ${
                  isAuthenticated 
                    ? 'bg-teal-600 text-white hover:bg-teal-700' 
                    : 'bg-gray-200 text-gray-600'
                } transition-colors`}
              >
                <span>View My Bookings</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Booking Benefits */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Why Book with TripSage?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find a lower price? We'll match it and give you an additional discount.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Bookings</h3>
              <p className="text-gray-600">
                Your personal and payment information is encrypted and securely protected.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Our travel experts are available around the clock to assist with any questions or issues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
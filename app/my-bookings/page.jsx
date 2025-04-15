'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { FaHotel, FaPlane, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaTicketAlt, FaCheckCircle, FaTimesCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function MyBookingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);
  
  // Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the authentication token
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch user bookings
        const response = await fetch('/api/bookings/user-bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const data = await response.json();
        setBookings(data.bookings || []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message || 'Failed to load bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [isAuthenticated]);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Format price
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    
    // Convert USD to INR (1 USD ≈ 83 INR)
    const inrPrice = price * 83;
    
    // Format in INR with ₹ symbol
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(inrPrice);
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaCheckCircle className="mr-1" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaSpinner className="mr-1" />
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaTimesCircle className="mr-1" />
            Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <FaExclamationTriangle className="mr-1" />
            {status || 'Unknown'}
          </span>
        );
    }
  };
  
  // Loading state
  if (loading || (isLoading && !error)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage all your bookings in one place
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* No Bookings */}
        {!isLoading && !error && (!bookings || bookings.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-6">
              You don't have any bookings yet. Start by searching for hotels or travel packages.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/bookings/hotel"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <FaHotel className="mr-2" />
                Book a Hotel
              </Link>
              <Link 
                href="/bookings/travel"
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                <FaPlane className="mr-2" />
                Book a Travel Package
              </Link>
            </div>
          </div>
        )}
        
        {/* Bookings List */}
        {!isLoading && !error && bookings && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center mb-2 md:mb-0">
                      {booking.booking_type === 'hotel' ? (
                        <FaHotel className="text-indigo-600 text-xl mr-2" />
                      ) : (
                        <FaPlane className="text-indigo-600 text-xl mr-2" />
                      )}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {booking.booking_type === 'hotel' ? (
                          booking.hotels?.name || 'Hotel Booking'
                        ) : (
                          booking.travel_packages?.name || 'Travel Package'
                        )}
                      </h2>
                    </div>
                    {getStatusBadge(booking.booking_status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Location</p>
                      <p className="flex items-center text-gray-900">
                        <FaMapMarkerAlt className="text-gray-400 mr-1" />
                        {booking.booking_type === 'hotel' ? (
                          booking.hotels?.location || 'N/A'
                        ) : (
                          booking.travel_packages?.destination || 'N/A'
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {booking.booking_type === 'hotel' ? 'Stay Dates' : 'Travel Date'}
                      </p>
                      <p className="flex items-center text-gray-900">
                        <FaCalendarAlt className="text-gray-400 mr-1" />
                        {booking.booking_type === 'hotel' ? (
                          `${formatDate(booking.check_in_date)} - ${formatDate(booking.check_out_date)}`
                        ) : (
                          formatDate(booking.travel_date)
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        {booking.booking_type === 'hotel' ? 'Guests' : 'Participants'}
                      </p>
                      <p className="flex items-center text-gray-900">
                        <FaUsers className="text-gray-400 mr-1" />
                        {booking.guests || booking.participants || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-100">
                    <div className="mb-2 md:mb-0">
                      <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                      <p className="flex items-center text-gray-900">
                        <FaTicketAlt className="text-gray-400 mr-1" />
                        {booking.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Total Price</p>
                      <p className="text-xl font-bold text-indigo-600">
                        {formatPrice(booking.total_price)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
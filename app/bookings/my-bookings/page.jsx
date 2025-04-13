'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import BookingCard from '../../components/booking/BookingCard';
import { FaLuggageCart, FaFilter, FaRegCalendarAlt } from 'react-icons/fa';

export default function MyBookingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filterType, setFilterType] = useState('all'); // 'all', 'hotel', 'travel'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'confirmed', 'pending', 'cancelled', 'completed'
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setIsLoading(true);
        
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
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
        setError('Failed to load your bookings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchUserBookings();
    }
  }, [isAuthenticated]);

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    const typeMatch = filterType === 'all' || booking.booking_type === filterType;
    const statusMatch = filterStatus === 'all' || booking.booking_status === filterStatus;
    return typeMatch && statusMatch;
  });

  // If still checking authentication, show nothing
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">
              View and manage all your hotel and travel bookings
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaFilter className="mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Type
                </label>
                <select
                  id="filter-type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Bookings</option>
                  <option value="hotel">Hotel Bookings</option>
                  <option value="travel">Travel Packages</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Booking Status
                </label>
                <select
                  id="filter-status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {/* Error Message */}
        {error && !isLoading && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* No Bookings */}
        {!isLoading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaLuggageCart className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            
            {bookings.length > 0 ? (
              <p className="text-gray-600 mb-6">
                Try adjusting your filters to see all your bookings.
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                You haven't made any bookings yet. Browse our hotels and travel packages to get started.
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/bookings/hotel')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Hotels
              </button>
              <button
                onClick={() => router.push('/bookings/travel')}
                className="px-6 py-2 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium rounded-lg transition-colors"
              >
                Explore Travel Packages
              </button>
            </div>
          </div>
        )}
        
        {/* Bookings List */}
        {!isLoading && !error && filteredBookings.length > 0 && (
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            {filteredBookings.some(booking => ['confirmed', 'pending'].includes(booking.booking_status)) && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaRegCalendarAlt className="mr-2 text-indigo-600" />
                  Upcoming Bookings
                </h2>
                <div className="space-y-4">
                  {filteredBookings
                    .filter(booking => ['confirmed', 'pending'].includes(booking.booking_status))
                    .sort((a, b) => {
                      // Sort by date (travel_date for travel packages, check_in_date for hotels)
                      const dateA = new Date(a.travel_date || a.check_in_date);
                      const dateB = new Date(b.travel_date || b.check_in_date);
                      return dateA - dateB;
                    })
                    .map(booking => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))
                  }
                </div>
              </div>
            )}
            
            {/* Past Bookings */}
            {filteredBookings.some(booking => ['completed', 'cancelled'].includes(booking.booking_status)) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FaRegCalendarAlt className="mr-2 text-gray-500" />
                  Past Bookings
                </h2>
                <div className="space-y-4">
                  {filteredBookings
                    .filter(booking => ['completed', 'cancelled'].includes(booking.booking_status))
                    .sort((a, b) => {
                      // Sort by date (most recent first)
                      const dateA = new Date(a.travel_date || a.check_in_date);
                      const dateB = new Date(b.travel_date || b.check_in_date);
                      return dateB - dateA;
                    })
                    .map(booking => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
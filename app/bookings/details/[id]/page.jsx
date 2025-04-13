'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaCheck, FaTimes, FaAngleLeft, FaDownload, FaPrint, FaEnvelope } from 'react-icons/fa';
import { format } from 'date-fns';

export default function BookingDetailsPage({ params }) {
  const { id } = params;
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bookings/details/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && id) {
      fetchBookingDetails();
    }
  }, [isAuthenticated, id]);

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    try {
      setCancelLoading(true);
      const response = await fetch(`/api/bookings/cancel/${id}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      const data = await response.json();
      setBooking(data.booking);
      setShowCancelConfirm(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Get status color based on booking status
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // If still checking authentication, show nothing
  if (loading || !isAuthenticated) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Booking not found'}</p>
              </div>
            </div>
          </div>
          <Link 
            href="/bookings/my-bookings" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaAngleLeft className="mr-1" />
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Determine booking details based on type
  const isHotelBooking = booking.booking_type === 'hotel';
  const bookingDetails = {
    name: isHotelBooking ? booking.hotels?.name : booking.travel_packages?.name,
    location: isHotelBooking ? booking.hotels?.location : booking.travel_packages?.destination,
    image: isHotelBooking 
      ? (booking.hotels?.images?.[0] || '/images/placeholder-hotel.jpg')
      : (booking.travel_packages?.images?.[0] || '/images/placeholder-travel.jpg'),
    dates: isHotelBooking
      ? `${formatDate(booking.check_in_date)} - ${formatDate(booking.check_out_date)}`
      : formatDate(booking.travel_date),
    people: isHotelBooking ? booking.guests : booking.participants,
    roomType: isHotelBooking ? booking.room_types?.name : null,
    description: isHotelBooking 
      ? booking.room_types?.description 
      : booking.travel_packages?.description,
    duration: isHotelBooking 
      ? null 
      : booking.travel_packages?.duration,
    amenities: isHotelBooking 
      ? booking.room_types?.amenities 
      : booking.travel_packages?.included_services
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/bookings/my-bookings" 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6"
        >
          <FaAngleLeft className="mr-1" />
          Back to My Bookings
        </Link>
        
        {/* Booking Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="relative h-48 md:h-64">
            <Image
              src={bookingDetails.image}
              alt={bookingDetails.name}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 w-full p-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{bookingDetails.name}</h1>
              <div className="flex items-center text-white/90">
                <FaMapMarkerAlt className="mr-2" />
                <span>{bookingDetails.location}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {/* Booking ID */}
              <div className="px-4 py-2 bg-gray-100 rounded-md text-sm flex items-center">
                <span className="font-semibold mr-2">Booking ID:</span>
                <span className="text-gray-700">{booking.id}</span>
              </div>
              
              {/* Booking Type */}
              <div className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md text-sm">
                {isHotelBooking ? 'Hotel Stay' : 'Travel Package'}
              </div>
              
              {/* Booking Status */}
              <div className={`px-4 py-2 rounded-md text-sm ${getStatusColor(booking.booking_status)}`}>
                {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
              </div>
              
              {/* Total Price */}
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-md text-sm font-semibold">
                ${booking.total_price.toFixed(2)}
              </div>
            </div>
            
            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Reservation Details</h2>
                
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <FaCalendarAlt className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {isHotelBooking ? 'Stay Dates' : 'Travel Date'}
                      </h3>
                      <p className="text-gray-900">{bookingDetails.dates}</p>
                    </div>
                  </div>
                  
                  {/* People */}
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <FaUsers className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {isHotelBooking ? 'Guests' : 'Participants'}
                      </h3>
                      <p className="text-gray-900">{bookingDetails.people} {bookingDetails.people === 1 ? 'person' : 'people'}</p>
                    </div>
                  </div>
                  
                  {/* Room Type (for hotel bookings) */}
                  {isHotelBooking && bookingDetails.roomType && (
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <FaCheck className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Room Type</h3>
                        <p className="text-gray-900">{bookingDetails.roomType}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Duration (for travel packages) */}
                  {!isHotelBooking && bookingDetails.duration && (
                    <div className="flex">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                        <FaCalendarAlt className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                        <p className="text-gray-900">{bookingDetails.duration} days</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Booking Date */}
                  <div className="flex">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <FaCalendarAlt className="text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Booking Date</h3>
                      <p className="text-gray-900">{formatDate(booking.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                {/* Description */}
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isHotelBooking ? 'Room Details' : 'Package Details'}
                </h2>
                <p className="text-gray-700 mb-4">{bookingDetails.description}</p>
                
                {/* Amenities/Included Services */}
                {bookingDetails.amenities && bookingDetails.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-2">
                      {isHotelBooking ? 'Room Amenities' : 'Included Services'}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {bookingDetails.amenities.map((item, index) => (
                        <div key={index} className="flex items-center text-sm">
                          <FaCheck className="text-green-500 mr-2" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Special Requests */}
                {booking.special_requests && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-900 mb-2">Special Requests</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                      {booking.special_requests}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
            
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaDownload className="mr-2" />
              Download PDF
            </button>
            
            <button 
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 flex items-center"
            >
              <FaEnvelope className="mr-2" />
              Email Confirmation
            </button>
          </div>
          
          {/* Cancel Button - only shown for confirmed or pending bookings */}
          {['confirmed', 'pending'].includes(booking.booking_status) && (
            <button 
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm flex items-center"
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaTimes className="mr-2" />
                  Cancel Booking
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Cancellation Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Cancellation</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
                {isHotelBooking && (
                  <span className="block mt-2 text-sm text-red-600">
                    Note: Cancellation fees may apply based on the hotel's policy.
                  </span>
                )}
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  disabled={cancelLoading}
                >
                  No, Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2 inline-block"></div>
                      Processing...
                    </>
                  ) : (
                    'Yes, Cancel Booking'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
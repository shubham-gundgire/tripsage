'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { format, addDays, differenceInDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaStar, FaMapMarkerAlt, FaCheck, FaWifi, FaSwimmingPool, 
         FaParking, FaUtensils, FaCoffee, FaGlassMartiniAlt, 
         FaCar, FaDumbbell, FaSpa, FaConciergeBell, FaCalendarAlt, 
         FaUsers, FaArrowLeft, FaInfo } from 'react-icons/fa';

export default function HotelDetailPage({ params }) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading } = useAuth();
  
  // Extract hotel name and location from URL params
  const hotelName = searchParams.get('name') || '';
  const hotelLocation = searchParams.get('location') || '';
  
  // State variables
  const [hotel, setHotel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [guests, setGuests] = useState(2);
  const [checkInDate, setCheckInDate] = useState(addDays(new Date(), 1));
  const [checkOutDate, setCheckOutDate] = useState(addDays(new Date(), 4));
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Calculate number of nights
  const nights = differenceInDays(checkOutDate, checkInDate);
  
  // Calculate total price
  const totalPrice = selectedRoomType ? selectedRoomType.price_per_night * nights : 0;

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch hotel details
  const fetchHotelDetails = useCallback(async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get auth token from local storage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('/api/llm/hotels/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: unwrappedParams.id,
            name: hotelName,
            location: hotelLocation
          })
        });
        
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch hotel details');
        }
        
        const data = await response.json();
      
      // Check if the API returned fallback data and show notification if needed
      if (data.is_fallback_data) {
        setToastMsg('Using cached hotel information. Some details may not be current.');
        setShowToast(true);
      }
      
        setHotel(data.hotel);
      
      // Initialize the booking form with the first room type
      if (data.hotel.room_types && data.hotel.room_types.length > 0) {
        setSelectedRoomType(data.hotel.room_types[0]);
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err);
      setError(err.message || 'Failed to fetch hotel details');
      } finally {
        setIsLoading(false);
      }
    }, [unwrappedParams, unwrappedParams.id, hotelName, hotelLocation]);
    
  // Call fetchHotelDetails when component mounts
  useEffect(() => {
    if (unwrappedParams.id && isAuthenticated) {
      fetchHotelDetails();
    }
  }, [unwrappedParams, unwrappedParams.id, isAuthenticated, fetchHotelDetails]);
  
  // Handle toast notifications
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [showToast]);
  
  // Handle booking form submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!selectedRoomType) {
      setBookingError('Please select a room type');
      return;
    }
    
    try {
      setBookingInProgress(true);
      setBookingError(null);
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Create detailed hotel information object to store in the database
      const hotelDetails = {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        description: hotel.description,
        rating: hotel.rating,
        reviews_count: hotel.reviews_count,
        main_image: hotel.images[0],
        room_type: {
          id: selectedRoomType.id,
          name: selectedRoomType.name,
          description: selectedRoomType.description,
          price_per_night: selectedRoomType.price_per_night,
          capacity: selectedRoomType.capacity
        },
        amenities: hotel.amenities,
        coordinates: hotel.coordinates
      };
      
      // Create the booking
      const response = await fetch('/api/bookings/create-hotel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          hotel_location: hotel.location,
          room_type_id: selectedRoomType.id,
          room_type: selectedRoomType.name,
          check_in_date: format(checkInDate, 'yyyy-MM-dd'),
          check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
          guests,
          total_price: totalPrice,
          special_requests: '',
          hotel_details: hotelDetails
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      // Show success message
      setBookingSuccess(true);
      
      // Redirect to bookings page after delay
      setTimeout(() => {
        router.push('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setBookingError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };
  
  // Format price
  const formatPrice = (price) => {
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

  // Loading state
  if (loading || (isLoading && !error)) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Link 
            href="/bookings/hotel" 
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            <FaArrowLeft className="mr-2" /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // If no hotel data
  if (!hotel) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Hotel Not Found</h3>
            <p className="text-gray-600 mb-6">
              The hotel you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/bookings/hotel"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              <FaArrowLeft className="mr-2" /> Back to Hotel Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render hotel details
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Toast notification */}
        {showToast && (
          <div className="fixed top-20 right-4 z-50 bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-md max-w-sm animate-fade-in-down">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{toastMsg}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setShowToast(false)}
                    className="inline-flex rounded-md p-1.5 text-amber-500 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Back button */}
        <div className="mb-6">
          <Link 
            href="/bookings/hotel"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft className="mr-2" /> Back to Hotel Search
          </Link>
        </div>
        
        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Booking successful! Redirecting to your bookings...
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {bookingError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{bookingError}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Hotel Overview */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="relative h-80 md:h-96">
            {hotel.images?.[0] ? (
                <Image
                src={hotel.images[0]}
                  alt={hotel.name}
                  className="object-cover"
                  fill
                  priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={(e) => {
                  // When image fails to load, show the default SVG
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            
            {/* Default SVG placeholder - shown when no image or image load fails */}
            <div 
              className={`absolute inset-0 bg-gray-200 flex flex-col items-center justify-center ${hotel.images?.[0] ? 'hidden' : 'flex'}`}
            >
              <svg className="w-20 h-20 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="mt-4 text-gray-600 text-lg font-medium">{hotel.name}</p>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{hotel.name}</h1>
              <div className="flex items-center text-white">
                <FaMapMarkerAlt className="mr-2" />
                <span>{hotel.location}</span>
                <div className="ml-4 flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span>{hotel.rating}</span>
                  <span className="ml-1 text-sm">({hotel.reviews_count} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-3">About This Hotel</h2>
                <p className="text-gray-600 mb-6">{hotel.description}</p>
                
                {/* Amenities */}
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {hotel.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start">
                      <FaCheck className="mt-1 mr-2 text-green-500 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
            </div>
            
                {/* Nearby Attractions */}
                <h2 className="text-xl font-semibold mb-3">Nearby Attractions</h2>
                <div className="space-y-3 mb-6">
                  {hotel.nearby_attractions.map((attraction, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-medium">{attraction.name}</h3>
                      <p className="text-sm text-gray-600">{attraction.description}</p>
                  </div>
                ))}
            </div>
            
                {/* Policies */}
                <h2 className="text-xl font-semibold mb-3">Hotel Policies</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                      <p className="text-sm font-medium">Check-in Time</p>
                      <p className="text-gray-600">{hotel.policies.check_in_time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Check-out Time</p>
                      <p className="text-gray-600">{hotel.policies.check_out_time}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium">Cancellation Policy</p>
                      <p className="text-gray-600">{hotel.policies.cancellation_policy}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Booking Form */}
              <div>
                <div className="bg-gray-50 p-5 rounded-xl sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Book Your Stay</h2>
              <form onSubmit={handleBooking}>
                    {/* Check-in/Check-out dates */}
                <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in & Check-out Dates
                  </label>
                      <div className="grid grid-cols-2 gap-2">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                          <DatePicker
                            selected={checkInDate}
                            onChange={date => {
                              setCheckInDate(date);
                              if (differenceInDays(checkOutDate, date) < 1) {
                                setCheckOutDate(addDays(date, 1));
                              }
                            }}
                            minDate={new Date()}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        document.querySelector('[id^=react-datepicker]')?.focus();
                      }}
                    >
                      <FaCalendarAlt className="text-indigo-500" />
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                          <DatePicker
                            selected={checkOutDate}
                            onChange={date => setCheckOutDate(date)}
                            minDate={addDays(checkInDate, 1)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        document.querySelector('[id^=react-datepicker]:nth-of-type(2)')?.focus();
                      }}
                    >
                      <FaCalendarAlt className="text-indigo-500" />
                    </button>
                  </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {nights} {nights === 1 ? 'night' : 'nights'}
                      </p>
                </div>
                
                {/* Guests */}
                <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guests
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUsers className="text-gray-400" />
                    </div>
                        <select
                      value={guests}
                          onChange={e => setGuests(Number(e.target.value))}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? 'guest' : 'guests'}
                            </option>
                          ))}
                        </select>
                  </div>
                </div>
                
                    {/* Room Selection */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Room Type
                  </label>
                      <div className="space-y-3">
                        {hotel.room_types.map(room => (
                          <div 
                            key={room.id}
                            className={`border rounded-lg p-3 cursor-pointer hover:border-indigo-500 transition-colors ${
                              selectedRoomType?.id === room.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                            }`}
                            onClick={() => setSelectedRoomType(room)}
                          >
                            <div className="flex justify-between">
                              <h3 className="font-medium">{room.name}</h3>
                              <span className="font-bold text-indigo-600">
                                {formatPrice(room.price_per_night)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Fits up to {room.capacity} {room.capacity === 1 ? 'person' : 'people'}
                            </p>
                          </div>
                        ))}
                      </div>
                </div>
                
                {/* Price Summary */}
                    <div className="border-t border-gray-200 pt-4 mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">
                          {formatPrice(selectedRoomType?.price_per_night || 0)} x {nights} nights
                        </span>
                        <span>{formatPrice((selectedRoomType?.price_per_night || 0) * nights)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-indigo-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
                
                    {/* Book Button */}
                <button
                  type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={bookingInProgress || bookingSuccess}
                >
                      {bookingInProgress ? (
                    <>
                          <span className="inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                      Processing...
                    </>
                      ) : bookingSuccess ? (
                        'Booking Confirmed!'
                  ) : (
                        'Book Now'
                  )}
                </button>
              </form>
            </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* More Images */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">More Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hotel.images.slice(1).length > 0 ? (
              hotel.images.slice(1).map((imageUrl, index) => (
                <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`${hotel.name} - Photo ${index + 2}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    onError={(e) => {
                      // When image fails to load, show the default SVG
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Default SVG placeholder - shown when image load fails */}
                  <div className="hidden absolute inset-0 bg-gray-200 flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-100 rounded-lg">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No additional photos available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
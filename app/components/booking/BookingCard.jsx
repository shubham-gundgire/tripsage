'use client';

import { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { FaHotel, FaPlane, FaCalendarAlt, FaUsers, FaCheck } from 'react-icons/fa';

export default function BookingCard({ booking }) {
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };
  
  // Format price - Convert USD to INR
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
  
  // Determine if it's a hotel or travel booking
  const isHotelBooking = booking.booking_type === 'hotel';
  
  // Get the name and image of the booked item
  const getBookingDetails = () => {
    if (isHotelBooking) {
      // Check if we have the new hotel_details format first
      if (booking.hotel_details) {
        try {
          const hotelDetails = typeof booking.hotel_details === 'string' 
            ? JSON.parse(booking.hotel_details) 
            : booking.hotel_details;
          
          return {
            name: hotelDetails.hotel_name || 'Hotel Booking',
            image: booking.image || '/images/placeholder-hotel.jpg',
            location: hotelDetails.hotel_location || '',
            roomType: hotelDetails.room_type || 'Standard Room',
            icon: <FaHotel className="text-indigo-500" />
          };
        } catch (err) {
          console.error("Error parsing hotel_details:", err);
        }
      }
      
      // Fallback to legacy format
      return {
        name: booking.name || booking.hotels?.name || 'Hotel Booking',
        image: booking.image || booking.hotels?.images?.[0] || '/images/placeholder-hotel.jpg',
        location: booking.location || booking.hotels?.location || '',
        roomType: booking.room_name || booking.room_types?.name || 'Standard Room',
        icon: <FaHotel className="text-indigo-500" />
      };
    } else {
      return {
        name: booking.name || booking.travel_packages?.name || 'Travel Package',
        image: booking.image || booking.travel_packages?.images?.[0] || '/images/placeholder-travel.jpg',
        location: booking.location || booking.travel_packages?.destination || '',
        icon: <FaPlane className="text-purple-500" />
      };
    }
  };
  
  const bookingDetails = getBookingDetails();
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col md:flex-row">
          {/* Booking Image */}
          <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
            <div className="relative h-36 w-full rounded-lg overflow-hidden">
              <Image
                src={bookingDetails.image}
                alt={bookingDetails.name}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                onError={(e) => {
                  // When image fails to load, show the SVG fallback
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* SVG Fallback for Hotel Images */}
              <div 
                className="absolute inset-0 bg-gray-200 hidden flex-col items-center justify-center"
              >
                {isHotelBooking ? (
                  <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="mt-3 text-gray-500 text-sm font-medium">
                  {bookingDetails.name}
                </p>
              </div>
              <div className={`absolute top-0 left-0 m-2 px-2 py-1 rounded-md bg-white/80 flex items-center`}>
                {bookingDetails.icon}
                <span className="ml-1 text-xs font-medium">
                  {isHotelBooking ? 'Hotel' : 'Travel'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Booking Info */}
          <div className="md:w-3/4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-900">{bookingDetails.name}</h3>
              <div className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(booking.booking_status)}`}>
                {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
              </div>
            </div>
            
            {bookingDetails.location && (
              <p className="text-gray-600 text-sm mb-3">{bookingDetails.location}</p>
            )}
            
            <div className="grid grid-cols-2 gap-y-3 mb-4">
              {isHotelBooking && (
                <>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium">Check-in</p>
                      <p>{formatDate(booking.check_in_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <div>
                      <p className="font-medium">Check-out</p>
                      <p>{formatDate(booking.check_out_date)}</p>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <FaUsers className="mr-2 text-gray-400" />
                <div>
                  <p className="font-medium">Guests</p>
                  <p>{booking.guests}</p>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-5 h-5 mr-2 flex items-center justify-center">
                  <span className="text-gray-400 font-bold">$</span>
                </div>
                <div>
                  <p className="font-medium">Total Price</p>
                  <p>{formatPrice(booking.total_price)}</p>
                </div>
              </div>
            </div>
            
            {/* Booking Date */}
            <div className="text-xs text-gray-500 mt-3">
              Booked on: {formatDate(booking.created_at)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
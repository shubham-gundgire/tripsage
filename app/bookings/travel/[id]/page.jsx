'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaClock, FaCheck, FaTimes, FaAngleLeft, FaPlane, FaHotel, FaUmbrellaBeach } from 'react-icons/fa';
import { format, addDays } from 'date-fns';

export default function TravelPackageDetailPage({ params }) {
  const { id } = params;
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [travelPackage, setTravelPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Booking form state
  const [selectedDate, setSelectedDate] = useState('');
  const [participants, setParticipants] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch travel package data
  useEffect(() => {
    const fetchTravelPackageData = async () => {
      try {
        setIsLoading(true);
        
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // First, check local storage for cached travel packages
        const cachedPackages = localStorage.getItem('travelPackages');
        let foundPackage = null;
        
        if (cachedPackages) {
          try {
            const packages = JSON.parse(cachedPackages);
            foundPackage = packages.find(pkg => pkg.id === id);
          } catch (e) {
            console.error('Error parsing cached travel packages:', e);
          }
        }
        
        // If package found in cache, use it
        if (foundPackage) {
          console.log('Using cached travel package data');
          setTravelPackage(foundPackage);
          setShowToast(true);
          setToastMsg('Using cached travel package information. Some details may not be current.');
          setTimeout(() => setShowToast(false), 6000);
          return;
        }
        
        // If not found in cache, fetch from API
        const response = await fetch('/api/llm/travel-packages/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id,
            // Include any other info that might help identify the package
            name: searchParams.get('name'),
            destination: searchParams.get('destination')
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch travel package details');
        }
        
        const data = await response.json();
        
        // If server indicates this is fallback data but returns null,
        // we need to fetch all packages and find the one with matching ID
        if (data.is_fallback_data && !data.travelPackage) {
          // Fetch all packages to find the one we need
          const allPackagesResponse = await fetch('/api/llm/travel-packages/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              destination: searchParams.get('destination') || 'Worldwide'
            })
          });
          
          if (!allPackagesResponse.ok) {
            throw new Error('Failed to fetch travel packages');
          }
          
          const allPackagesData = await allPackagesResponse.json();
          const matchingPackage = allPackagesData.travelPackages.find(pkg => pkg.id === id);
          
          if (matchingPackage) {
            // Cache for future use
            localStorage.setItem('travelPackages', JSON.stringify(allPackagesData.travelPackages));
            setTravelPackage(matchingPackage);
            
            // Show toast notification
            setShowToast(true);
            setToastMsg('Using cached travel package information. Some details may not be current.');
            setTimeout(() => setShowToast(false), 6000);
          } else {
            throw new Error('Travel package not found');
          }
        } else {
          // If server returned the package directly
          setTravelPackage(data.travelPackage);
        }
      } catch (err) {
        console.error('Error fetching travel package details:', err);
        setError('Failed to load travel package details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && id) {
      fetchTravelPackageData();
    }
  }, [isAuthenticated, id, searchParams]);

  // Calculate total price when relevant fields change
  useEffect(() => {
    const calculateTotalPrice = () => {
      if (!travelPackage || !selectedDate || participants < 1) {
        setTotalPrice(0);
        return;
      }
      
      const pricePerPerson = travelPackage.discounted_price || travelPackage.price;
      setTotalPrice(pricePerPerson * participants);
    };
    
    calculateTotalPrice();
  }, [travelPackage, selectedDate, participants]);

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!selectedDate || participants < 1) {
      setBookingError('Please fill in all required fields');
      return;
    }
    
    setBookingLoading(true);
    setBookingError('');
    
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create booking object with travel package details
      const bookingData = {
        booking_type: 'travel',
        travel_package_id: id,
        package_name: travelPackage.name,
        destination: travelPackage.destination,
        duration: travelPackage.duration,
        package_type: travelPackage.categories?.[0] || 'Travel Package',
        travel_date: selectedDate,
        participants: parseInt(participants),
        total_price: totalPrice,
        special_requests: specialRequests,
        booking_status: 'confirmed'
      };
      
      // Send booking request to the new endpoint
      const response = await fetch('/api/bookings/create-travel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      // Show success and reset form
      setBookingSuccess(true);
      setSelectedDate('');
      setParticipants(1);
      setSpecialRequests('');
      setTotalPrice(0);
      
      // Redirect to bookings page after a short delay
      setTimeout(() => {
        router.push('/my-bookings');
      }, 2000);
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Format date for input
  const formatDateForInput = (date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Format price - Convert USD to INR
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

  // Get tomorrow's date for min travel date
  const tomorrow = formatDateForInput(addDays(new Date(), 1));

  // If still checking authentication, show nothing
  if (loading || !isAuthenticated) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !travelPackage) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error || 'Travel package not found'}</p>
              </div>
            </div>
          </div>
          <Link 
            href="/bookings/travel" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800"
          >
            <FaAngleLeft className="mr-1" />
            Back to Travel Packages
          </Link>
        </div>
      </div>
    );
  }

  // Success state (after booking)
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="bg-green-50 rounded-xl p-8 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheck className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking for {travelPackage.name} has been successfully confirmed. You'll be redirected to your bookings page.
            </p>
            <Link 
              href="/bookings/my-bookings" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
        
        {/* Back Button */}
        <Link 
          href="/bookings/travel" 
          className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
        >
          <FaAngleLeft className="mr-1" />
          Back to Travel Packages
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Travel Package Info */}
          <div className="lg:w-2/3">
            {/* Package Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{travelPackage.name}</h1>
                <div className="flex items-center bg-purple-100 px-3 py-1 rounded-lg">
                  <FaStar className="text-yellow-500 mr-1" />
                  <span className="text-purple-800 font-semibold">{travelPackage.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <FaMapMarkerAlt className="mr-2 text-gray-500" />
                <span>{travelPackage.destination}</span>
              </div>
            </div>
            
            {/* Package Images */}
            <div className="mb-8">
              <div className="relative h-80 w-full rounded-xl overflow-hidden mb-2">
                <Image
                  src={travelPackage.images[activeImageIndex] || '/images/placeholder-travel.jpg'}
                  alt={travelPackage.name}
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
              
              {travelPackage.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {travelPackage.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative h-20 rounded-lg overflow-hidden cursor-pointer ${
                        index === activeImageIndex ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`${travelPackage.name} image ${index + 1}`}
                        className="object-cover"
                        fill
                        sizes="20vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Package Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About this travel package</h2>
              <p className="text-gray-600 mb-6">{travelPackage.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center text-purple-700 mb-1">
                    <FaClock className="mr-2" />
                    <span className="font-semibold">Duration</span>
                  </div>
                  <p className="text-gray-700">{travelPackage.duration} days</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center text-purple-700 mb-1">
                    <FaUsers className="mr-2" />
                    <span className="font-semibold">Group Size</span>
                  </div>
                  <p className="text-gray-700">Max {travelPackage.max_participants} people</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center text-purple-700 mb-1">
                    <FaCalendarAlt className="mr-2" />
                    <span className="font-semibold">Available</span>
                  </div>
                  <p className="text-gray-700">{travelPackage.availability || 'Year-round'}</p>
                </div>
              </div>
              
              {/* Highlights */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Trip Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {travelPackage.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start">
                    <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Itinerary */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Itinerary</h2>
              <div className="space-y-6">
                {travelPackage.itinerary.map((day, index) => (
                  <div key={index} className="border-l-2 border-purple-200 pl-4 ml-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Day {index + 1}: {day.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{day.description}</p>
                    
                    {day.activities && day.activities.length > 0 && (
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {day.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="mb-1">{activity}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Included/Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaCheck className="text-green-500 mr-2" /> 
                  What's Included
                </h3>
                <ul className="space-y-2">
                  {travelPackage.included_services.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaTimes className="text-red-500 mr-2" /> 
                  What's Not Included
                </h3>
                <ul className="space-y-2">
                  {travelPackage.excluded_services.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaTimes className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Package Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Package Features</h3>
              <div className="flex flex-wrap gap-2">
                {travelPackage.categories && travelPackage.categories.map((category, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                ))}
                
                {travelPackage.features && travelPackage.features.map((feature, index) => (
                  <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Booking Form */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Book This Package</h2>
              
              {/* Price Display */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  {travelPackage.discounted_price ? (
                    <div>
                      <span className="text-sm text-gray-500 line-through mr-2">
                        {formatPrice(travelPackage.price)}
                      </span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatPrice(travelPackage.discounted_price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-purple-600">
                      {formatPrice(travelPackage.price)}
                    </span>
                  )}
                  <span className="text-gray-600 text-sm"> / per person</span>
                </div>
                
                {travelPackage.discounted_price && (
                  <div className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-semibold">
                    Save {Math.round(((travelPackage.price - travelPackage.discounted_price) / travelPackage.price) * 100)}%
                  </div>
                )}
              </div>
              
              {bookingError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                  <p className="text-sm text-red-700">{bookingError}</p>
                </div>
              )}
              
              <form onSubmit={handleBooking}>
                {/* Travel Date */}
                <div className="mb-4">
                  <label htmlFor="travel-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      id="travel-date"
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={tomorrow}
                      required
                    />
                  </div>
                </div>
                
                {/* Participants */}
                <div className="mb-4">
                  <label htmlFor="participants" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Participants*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUsers className="text-gray-400" />
                    </div>
                    <input
                      id="participants"
                      type="number"
                      min="1"
                      max={travelPackage.max_participants || 10}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum {travelPackage.max_participants || 10} participants per booking
                  </p>
                </div>
                
                {/* Special Requests */}
                <div className="mb-6">
                  <label htmlFor="special-requests" className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests (optional)
                  </label>
                  <textarea
                    id="special-requests"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any dietary requirements, accessibility needs, or special requests..."
                  ></textarea>
                </div>
                
                {/* Package Features Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Overview</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-gray-700">
                      <FaPlane className="text-purple-500 mr-2" />
                      {travelPackage.duration} days adventure
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <FaHotel className="text-purple-500 mr-2" />
                      {travelPackage.accommodation_type || 'Accommodation included'}
                    </li>
                    <li className="flex items-center text-sm text-gray-700">
                      <FaUmbrellaBeach className="text-purple-500 mr-2" />
                      {travelPackage.activity_level || 'Various activities'}
                    </li>
                  </ul>
                </div>
                
                {/* Price Summary */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Price:</span>
                    <span className="text-xl font-bold text-purple-600">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Price includes all listed services. A 20% deposit may be required to secure your booking.
                  </p>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  disabled={bookingLoading || totalPrice <= 0}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
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
  );
} 
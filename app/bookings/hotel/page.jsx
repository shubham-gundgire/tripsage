'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaUserFriends, FaBed, FaArrowRight, FaWifi, FaSwimmingPool, FaParking, FaUtensils, FaDumbbell, FaSpa, FaConciergeBell, FaAngleRight, FaInfoCircle } from 'react-icons/fa';

export default function HotelBookingsPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // State variables
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Filter state
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!location) {
      setError('Please enter a destination');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchInitiated(true);
    
    try {
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('Authentication token not found');
        setError('Authentication token not found. Please log in again.');
        setIsLoading(false);
        return;
      }
      
      // Call the LLM-powered hotel search API
      const response = await fetch('/api/llm/hotels/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          rating: rating || undefined
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search hotels');
      }
      
      const data = await response.json();
      setHotels(data.hotels || []);
      
      // Check if using fallback data and show notification
      if (data.is_fallback_data) {
        setToastMsg('Showing generated hotels based on your search. Data may not reflect actual hotels.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 6000);
      }
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError(err.message || 'Failed to search hotels. Please try again.');
    } finally {
      setIsLoading(false);
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

  // If still checking authentication, show nothing
  if (loading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast notification */}
        {showToast && (
          <div className="fixed top-20 right-4 z-50 bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded shadow-md max-w-sm animate-fade-in-down">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-amber-500" />
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
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Find Your Perfect Hotel</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our selection of premium hotels worldwide and book your next stay with ease.
          </p>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Where are you going?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-lg flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" />
                      Search Hotels
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mb-2">
              <button
                type="button"
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <FaFilter className="mr-1" />
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
              </button>
            </div>
            
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    id="min-price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Min price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    min="0"
                  />
                </div>
                
                <div>
                  <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    id="max-price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={minPrice || "0"}
                  />
                </div>
                
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Rating
                  </label>
                  <select
                    id="rating"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Loading State */}
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
        
        {/* Initial State - No Search Yet */}
        {!isLoading && !error && !searchInitiated && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Search for Hotels</h3>
            <p className="text-gray-600 mb-6">
              Enter a destination above to discover available hotels.
            </p>
          </div>
        )}
        
        {/* No Results After Search */}
        {!isLoading && !error && searchInitiated && hotels.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters or explore different destinations.
            </p>
          </div>
        )}
        
        {/* Hotels Grid */}
        {!isLoading && !error && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  {hotel.images?.[0] ? (
                    <Image
                      src={hotel.images[0]}
                      alt={hotel.name}
                      className="object-cover"
                      fill
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
                    <svg className="w-12 h-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-500">{hotel.name}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <div className="flex items-center bg-indigo-100 text-indigo-800 rounded-lg px-2 py-1">
                      <FaStar className="text-yellow-500 mr-1" />
                      <span>{hotel.rating}</span>
                    </div>
                  </div>
                  
                  <p className="flex items-center text-gray-600 text-sm mb-4">
                    <FaMapMarkerAlt className="mr-1" />
                    {hotel.location}
                  </p>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {hotel.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(hotel.amenities || []).slice(0, 3).map((amenity, index) => (
                      <span key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-800">
                        {amenity}
                      </span>
                    ))}
                    {(hotel.amenities || []).length > 3 && (
                      <span className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-800">
                        +{hotel.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <span className="text-gray-500 text-sm">From</span>
                      <div className="text-xl font-bold text-indigo-700">{formatPrice(hotel.price_per_night)}</div>
                      <span className="text-gray-500 text-xs">per night</span>
                    </div>
                    
                    <Link 
                      href={`/bookings/hotel/${hotel.id}?name=${encodeURIComponent(hotel.name)}&location=${encodeURIComponent(hotel.location)}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      View Hotel
                      <FaArrowRight className="ml-2" />
                    </Link>
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
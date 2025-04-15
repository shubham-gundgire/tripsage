'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { FaSearch, FaFilter, FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaPlane, FaArrowRight } from 'react-icons/fa';

export default function TravelPackagesPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // State variables
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [destination, setDestination] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Check authentication
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch travel packages
  useEffect(() => {
    const fetchTravelPackages = async () => {
      try {
        setIsLoading(true);
        
        // Get the authentication token
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Authentication token not found');
          setError('Authentication token not found. Please log in again.');
          return;
        }
        
        // Create search parameters
        const searchData = {
          destination: destination || 'Worldwide',
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          duration: duration || null
        };
        
        console.log('Searching travel packages with:', searchData);
        
        // Use the new LLM-based API endpoint
        const response = await fetch('/api/llm/travel-packages/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(searchData)
        });
        
        if (!response.ok) {
          console.error('Travel packages API response not OK:', response.status, response.statusText);
          throw new Error(`Failed to fetch travel packages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle fallback data notification
        if (data.is_fallback_data) {
          setShowToast(true);
          setToastMsg('Using cached travel package information. Some details may not be current.');
          setTimeout(() => setShowToast(false), 6000);
        }
        
        setPackages(data.travelPackages || []);
      } catch (err) {
        console.error('Error fetching travel packages:', err);
        setError('Failed to load travel packages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchTravelPackages();
    }
  }, [isAuthenticated, destination, minPrice, maxPrice, duration]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger the search based on state changes
  };

  // Format price - Convert USD to INR
  const formatPrice = (price) => {
    // Convert USD to INR (1 USD ≈ 83 INR)
    const inrPrice = price * 83? price * 83:10000;

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
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Explore Travel Packages</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover curated travel experiences with flights, accommodations, and unique activities included.
          </p>
        </div>
        
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
        
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-grow">
                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="destination"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Where do you want to go?"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  &nbsp;
                </label>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg flex items-center justify-center"
                >
                  <FaSearch className="mr-2" />
                  Search Packages
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mb-2">
              <button
                type="button"
                className="text-purple-600 hover:text-purple-800 text-sm flex items-center"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Max price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    min={minPrice || "0"}
                  />
                </div>
                
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (days)
                  </label>
                  <select
                    id="duration"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="">Any Duration</option>
                    <option value="1-3">1-3 days</option>
                    <option value="4-7">4-7 days</option>
                    <option value="8-14">8-14 days</option>
                    <option value="15+">15+ days</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
        
        {/* No Results */}
        {!isLoading && !error && packages.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No travel packages found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters or explore different destinations.
            </p>
          </div>
        )}
        
        {/* Travel Packages Grid */}
        {!isLoading && !error && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-52">
                  <Image
                    src={pkg.images[0] || '/images/placeholder-travel.jpg'}
                    alt={pkg.name}
                    className="object-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {pkg.discounted_price && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-semibold">
                      Save {Math.round(((pkg.price - pkg.discounted_price) / pkg.price) * 100)}%
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                    <div className="flex items-center text-amber-500">
                      <FaStar className="mr-1" />
                      <span className="text-gray-800">{pkg.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <FaMapMarkerAlt className="mr-2 text-gray-500" />
                    <span>{pkg.destination}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      <span>{pkg.duration} days</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaUsers className="mr-2 text-gray-500" />
                      <span>Max {pkg.max_participants}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pkg.categories && pkg.categories.slice(0, 3).map((category, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {category}
                      </span>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Starting from</p>
                      <p className="text-xl font-bold text-purple-600">
                        {pkg.discounted_price ? (
                          <>
                            <span className="text-sm text-gray-400 line-through mr-1">{formatPrice(pkg.price)}</span>
                            {formatPrice(pkg.discounted_price)}
                          </>
                        ) : (
                          <>{formatPrice(pkg.price)}</>
                        )}
                      </p>
                    </div>
                    
                    <Link
                      href={`/bookings/travel/${pkg.id}?name=${encodeURIComponent(pkg.name)}&destination=${encodeURIComponent(pkg.destination)}`}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center"
                    >
                      View Details <FaArrowRight className="ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Featured Benefits */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Why Choose Our Travel Packages</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <FaPlane />
              </div>
              <h3 className="text-lg font-semibold mb-2">All-Inclusive Experience</h3>
              <p className="text-gray-600">
                Our packages include flights, accommodations, transfers, and curated activities so you can focus on enjoying your trip.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Best Value for Money</h3>
              <p className="text-gray-600">
                Enjoy significant savings compared to booking each component separately, with no hidden fees or surprise costs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Local Guides</h3>
              <p className="text-gray-600">
                Our knowledgeable local guides provide authentic experiences and insider access to each destination's best-kept secrets.
              </p>
            </div>
          </div>
        </div>
        
        {/* Pagination (if needed) */}
        {!isLoading && !error && packages.length > 0 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700">
                1
              </button>
              <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
} 
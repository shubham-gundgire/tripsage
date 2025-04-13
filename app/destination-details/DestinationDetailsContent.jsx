'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaHotel, FaUtensils, FaPlane, FaMapMarkedAlt, FaMoneyBillWave, 
  FaCalendarAlt, FaLightbulb, FaShoppingBag, FaStar, FaSpinner, FaUsers, FaClock, FaAngleUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Components
import SearchBar from '../components/SearchBar';
import ErrorMessage from '../components/ErrorMessage';

export default function DestinationDetailsContent() {
  const searchParams = useSearchParams();
  const destination = searchParams.get('destination') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const guests = searchParams.get('guests') || '1';

  const [destinationData, setDestinationData] = useState({});
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionLoading, setSectionLoading] = useState({});

  const router = useRouter();
  const contentRef = useRef(null);

  // Function to convert price to INR
  const convertToINR = (priceString) => {
    // Handle null, undefined, or non-string inputs
    if (!priceString) return 'Price not available';
    
    // Convert to string if number is passed
    const priceStr = String(priceString);
    
    // If already in INR, return as is
    if (priceStr.includes('₹') || priceStr.toLowerCase().includes('inr') || priceStr.toLowerCase().includes('rupee')) {
      return priceStr;
    }
    
    // Try to extract numeric values
    const numericValues = priceStr.match(/[\d,]+(\.\d+)?/g);
    if (!numericValues || numericValues.length === 0) {
      return priceStr;
    }
    
    // Convert the extracted numeric values to INR
    let result = priceStr;
    for (const value of numericValues) {
      const cleanValue = value.replace(/,/g, '');
      const numValue = parseFloat(cleanValue);
      let inrValue;
      
      // Assume USD as default currency if no symbol is specified
      if (priceStr.includes('$') || priceStr.toLowerCase().includes('usd')) {
        inrValue = (numValue * 83).toFixed(0); // 1 USD ≈ 83 INR (approximate)
      } else if (priceStr.includes('€') || priceStr.toLowerCase().includes('eur')) {
        inrValue = (numValue * 90).toFixed(0); // 1 EUR ≈ 90 INR (approximate)
      } else if (priceStr.includes('£') || priceStr.toLowerCase().includes('gbp')) {
        inrValue = (numValue * 105).toFixed(0); // 1 GBP ≈ 105 INR (approximate)
      } else {
        inrValue = (numValue * 83).toFixed(0); // Default to USD conversion
      }
      
      // Format with commas for thousands separator
      const formattedINR = parseInt(inrValue).toLocaleString('en-IN');
      result = result.replace(value, formattedINR);
    }
    
    // Replace currency symbols with ₹ symbol
    result = result.replace(/\$|USD|usd|\€|EUR|eur|\£|GBP|gbp/g, '₹');
    
    return result;
  };

  // Sections to be loaded
  const sections = [
    { id: 'overview', title: 'Destination Overview', icon: <FaStar /> },
    { id: 'accommodation', title: 'Accommodation Options', icon: <FaHotel /> },
    { id: 'food', title: 'Food and Dining', icon: <FaUtensils /> },
    { id: 'transportation', title: 'Travel & Transportation', icon: <FaPlane /> },
    { id: 'events', title: 'Events & Activities', icon: <FaMapMarkedAlt /> },
    { id: 'budget', title: 'Budget Estimate', icon: <FaMoneyBillWave /> },
    { id: 'itinerary', title: 'Suggested Itinerary', icon: <FaCalendarAlt /> },
    { id: 'tips', title: 'Travel Tips', icon: <FaLightbulb /> },
    { id: 'shopping', title: 'Shopping & Souvenirs', icon: <FaShoppingBag /> },
  ];

  // Calculate trip duration
  const getDuration = () => {
    if (!startDate || !endDate) return 'N/A';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + ' day' + (diffDays > 1 ? 's' : '');
  };

  // Load initial data on mount
  useEffect(() => {
    if (destination) {
      loadDestinationOverview();
    } else {
      setLoading(false);
    }
  }, [destination, startDate, endDate, guests]);

  // Load data when section changes
  useEffect(() => {
    if (destination && activeSection && !destinationData[activeSection]) {
      loadSectionData(activeSection);
    }
  }, [activeSection]);

  const loadDestinationOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSectionData('overview');
      setDestinationData(prev => ({ ...prev, overview: result }));
    } catch (err) {
      setError(`Failed to load destination information: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSectionData = async (section) => {
    if (destinationData[section]) return;
    
    setSectionLoading(prev => ({ ...prev, [section]: true }));
    try {
      const result = await fetchSectionData(section);
      setDestinationData(prev => ({ ...prev, [section]: result }));
    } catch (err) {
      console.error(`Error loading ${section} data:`, err);
      setError(`Failed to load ${section} information`);
    } finally {
      setSectionLoading(prev => ({ ...prev, [section]: false }));
    }
  };

  const fetchSectionData = async (section) => {
    try {
      const response = await fetch('/api/destination-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          guests: parseInt(guests, 10),
          section
        })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Try once more if first attempt fails
      console.log(`Retrying ${section} data fetch due to error:`, error);
      
      try {
        const response = await fetch('/api/destination-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination,
            startDate,
            endDate,
            guests: parseInt(guests, 10),
            section
          })
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (retryError) {
        console.error('Failed after retry. Error:', retryError);
        throw new Error(`Failed after retry: ${retryError.message}`);
      }
    }
  };

  // Handle section click with smooth scrolling to content area
  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    // Add a small delay to ensure content is loaded before scrolling
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Perfect Destination</h1>
          <SearchBar className="max-w-3xl mx-auto mb-12" />
          <p className="text-gray-600 mt-8">Enter a destination to get started with your travel planning</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading destination information...</h2>
          <p className="text-gray-500 mt-2">We're gathering the best travel details for {destination}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} retry={loadDestinationOverview} />;
  }

  const renderSectionContent = (section) => {
    if (sectionLoading[section]) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-indigo-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading {sections.find(s => s.id === section)?.title}...</p>
        </div>
      );
    }

    if (!destinationData[section]) {
      return (
        <div className="py-16 text-center">
          <p className="text-gray-500 mb-4">Information not loaded yet</p>
          <button
            onClick={() => loadSectionData(section)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium"
          >
            Load Data
          </button>
        </div>
      );
    }

    const sectionData = destinationData[section];
    
    switch (section) {
      case 'overview':
        return (
          <div>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">{sectionData.description}</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaStar className="text-indigo-600 text-sm" />
                </span>
                Top Attractions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {sectionData.attractions.map((item, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                    <span className="text-indigo-500 mr-3 mt-0.5 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <h3 className="text-xl font-semibold mb-3 text-indigo-700">Cultural Highlights</h3>
              <p className="text-gray-700">{sectionData.cultural}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaCalendarAlt className="text-indigo-600 text-sm" />
                </span>
                Weather & Climate
              </h3>
              <p className="text-gray-700">{sectionData.weather}</p>
            </div>
            
            {sectionData.safety && (
              <div className="p-6 rounded-xl bg-amber-50 border border-amber-100">
                <h3 className="text-xl font-semibold mb-3 text-amber-700">Safety Tips</h3>
                <p className="text-gray-700">{sectionData.safety}</p>
              </div>
            )}
          </div>
        );

      // Other section case handlers...
      // Note: The actual component has many more cases, which I've abbreviated
      // for brevity in this answer
        
      default:
        return <p>Select a section to view information</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Parallax Effect and Scrollable Header */}
      <div className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-110"
          style={{
            backgroundImage: `url(https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)})`,
            transform: 'scale(1.1)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/90 via-purple-900/85 to-black/80 backdrop-blur-sm" />
        </div>
        
        <div className="absolute inset-0 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center">
            <div className="text-center text-white px-4 py-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl lg:text-7xl font-russo mb-4"
              >
                {destination}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base"
              >
                {startDate && endDate && (
                  <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                    <FaCalendarAlt className="mr-2" />
                    <span>{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <FaUsers className="mr-2" />
                  <span>{guests} {parseInt(guests) === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full">
                  <FaCalendarAlt className="mr-2" />
                  <span>{getDuration()}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative z-10 -mt-8 px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-1">
            <SearchBar 
              defaultValues={{
                destination,
                startDate,
                endDate,
                guests
              }} 
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinationData.overview && [
              {
                label: 'Best Time',
                value: destinationData.overview.bestTime || 'Year Round',
                icon: <FaCalendarAlt className="text-white" />,
                gradient: 'from-blue-500 to-indigo-600'
              },
              {
                label: 'Language',
                value: destinationData.overview.language || 'Multiple',
                icon: <FaUsers className="text-white" />,
                gradient: 'from-purple-500 to-pink-600'
              },
              {
                label: 'Currency',
                value: destinationData.overview.currency || 'Local',
                icon: <FaMoneyBillWave className="text-white" />,
                gradient: 'from-emerald-500 to-teal-600'
              },
              {
                label: 'Time Zone',
                value: destinationData.overview.timezone || 'Local',
                icon: <FaClock className="text-white" />,
                gradient: 'from-amber-500 to-orange-600'
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 duration-300"
              >
                <div className={`p-4 bg-gradient-to-r ${stat.gradient}`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                    {stat.icon}
                  </div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-8">
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <h2 className="font-semibold text-white text-xl">Explore {destination}</h2>
                  <p className="text-white/80 text-sm mt-1">Discover everything about your destination</p>
                </div>
                <nav className="p-4">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      whileHover={{ x: 4 }}
                      className={`w-full text-left flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      <span className={`mr-3 ${activeSection === section.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {section.icon}
                      </span>
                      <span className="text-sm font-medium">{section.title}</span>
                      {sectionLoading[section.id] && (
                        <FaSpinner className="ml-auto animate-spin text-indigo-500" />
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              <div ref={contentRef} className="bg-white rounded-2xl shadow-lg p-8">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="prose prose-lg max-w-none"
                >
                  {renderSectionContent(activeSection)}
                </motion.div>
              </div>

              {/* Related Destinations */}
              {destinationData.overview && destinationData.overview.relatedDestinations && (
                <div className="mt-8">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">Similar Destinations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {destinationData.overview.relatedDestinations.map((related, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/destination-details?destination=${encodeURIComponent(related.name)}`)}
                      >
                        <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                          <img
                            src={`https://source.unsplash.com/400x300/?${encodeURIComponent(related.name)}`}
                            alt={related.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{related.name}</h4>
                        <p className="text-sm text-gray-500">{related.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg flex items-center justify-center"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <FaAngleUp className="text-2xl" />
        </motion.button>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaHotel, FaUtensils, FaPlane, FaMapMarkedAlt, FaMoneyBillWave, 
  FaCalendarAlt, FaLightbulb, FaShoppingBag, FaStar, FaSpinner, FaUsers, FaClock, FaAngleUp, FaLeaf, FaCheck, FaExclamation } from 'react-icons/fa';
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
      // Reset all data when destination changes
      setDestinationData({});
      setActiveSection('overview');
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
  }, [activeSection, destination, destinationData]);

  const loadDestinationOverview = async () => {
    setLoading(true);
    setError(null);
    setSectionLoading({});
    
    try {
      const result = await fetchSectionData('overview');
      // Replace entire state rather than merging
      setDestinationData({ overview: result });
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

      case 'tips':
        return (
          <div className="space-y-8">
            {/* Best Time to Visit */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <FaCalendarAlt className="text-blue-600 text-sm" />
                </span>
                Best Time to Visit
              </h3>
              <p className="text-gray-700">{sectionData.bestTime}</p>
              
              {sectionData.currentSeason && (
                <div className="mt-4 p-4 bg-white/50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">For your travel dates:</h4>
                  <p className="text-gray-700">{sectionData.currentSeason}</p>
                </div>
              )}
            </div>
            
            {/* Local Customs */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100">
              <h3 className="text-xl font-semibold mb-3 text-purple-700 flex items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <FaUsers className="text-purple-600 text-sm" />
                </span>
                Local Customs
              </h3>
              <p className="text-gray-700">{sectionData.customs}</p>
            </div>
            
            {/* Etiquette Tips */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
              <h3 className="text-xl font-semibold mb-4 text-amber-700 flex items-center">
                <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                  <FaLightbulb className="text-amber-600 text-sm" />
                </span>
                Etiquette Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionData.etiquetteTips.map((tip, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-white hover:bg-amber-50/50 transition-colors">
                    <span className="text-amber-500 mr-3 mt-0.5 bg-amber-50 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Language Information */}
            {sectionData.language && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                <h3 className="text-xl font-semibold mb-3 text-emerald-700 flex items-center">
                  <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                    <FaUsers className="text-emerald-600 text-sm" />
                  </span>
                  Language
                </h3>
                <p className="text-gray-700 mb-4">{sectionData.language.overview}</p>
                
                <h4 className="font-medium text-emerald-700 mb-3">Useful Phrases:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sectionData.language.phrases.map((phrase, index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg bg-white hover:bg-emerald-50/50 transition-colors">
                      <span className="text-emerald-500 mr-3 mt-0.5 bg-emerald-50 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 font-medium">{phrase}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Emergency Information */}
            {sectionData.emergency && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-100">
                <h3 className="text-xl font-semibold mb-3 text-red-700 flex items-center">
                  <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </span>
                  Emergency Information
                </h3>
                <p className="text-gray-700 mb-4">{sectionData.emergency.info}</p>
                
                <div className="bg-white/70 rounded-lg p-4">
                  <h4 className="font-medium text-red-700 mb-3">Emergency Contacts:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sectionData.emergency.contacts.map((contact, index) => (
                      <div key={index} className="flex items-center p-2 rounded-md hover:bg-red-50/50 transition-colors">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-gray-700 font-medium">{contact}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-8">
            {/* Shopping Overview */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <h3 className="text-xl font-semibold mb-3 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaShoppingBag className="text-indigo-600 text-sm" />
                </span>
                Shopping Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">{sectionData.overview}</p>
            </div>
            
            {/* Shopping Areas */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaMapMarkedAlt className="text-indigo-600 text-sm" />
                </span>
                Shopping Areas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sectionData.shoppingAreas.map((area, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="h-32 bg-gradient-to-r from-indigo-400 to-purple-500 relative">
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <h4 className="text-white text-lg font-semibold px-4 text-center">{area.name}</h4>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium mb-3">
                        {area.type}
                      </div>
                      <p className="text-gray-700">{area.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Souvenirs */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
              <h3 className="text-xl font-semibold mb-4 text-amber-700 flex items-center">
                <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                  <FaShoppingBag className="text-amber-600 text-sm" />
                </span>
                Recommended Souvenirs
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sectionData.souvenirs.map((item, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-white hover:bg-amber-50/50 transition-colors">
                    <span className="text-amber-500 mr-3 mt-0.5 bg-amber-50 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                      •
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Shopping Tips */}
            <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold mb-3 text-blue-700">Shopping Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">Bargaining is expected in street markets and bazaars - start at 40-50% of the quoted price.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">Carry cash for street markets as many vendors don't accept cards.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">Ask for a receipt for valuable purchases, especially jewelry.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-700">Be prepared for crowds, especially on weekends and holidays.</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'itinerary':
        return (
          <div className="space-y-8">
            {/* Itinerary Introduction */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <FaCalendarAlt className="text-blue-600 text-sm" />
                </span>
                Your Personalized Itinerary
              </h3>
              <p className="text-gray-700 leading-relaxed">{sectionData.intro}</p>
            </div>
            
            {/* Daily Itinerary */}
            <div className="space-y-8">
              {sectionData.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-5">
                    <h3 className="text-white text-lg sm:text-xl font-semibold">{day.title}</h3>
                  </div>
                  
                  {/* Day Activities */}
                  <div className="relative">
                    {/* Timeline */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200 hidden sm:block"></div>
                    
                    <div className="py-2">
                      {day.activities.map((activity, actIndex) => (
                        <div 
                          key={actIndex} 
                          className={`relative p-4 sm:pl-16 ${
                            actIndex !== day.activities.length - 1 ? 'border-b border-gray-100' : ''
                          }`}
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-indigo-100 border-2 border-indigo-400 hidden sm:block"></div>
                          
                          {/* Time */}
                          <div className="text-indigo-500 font-medium mb-1 sm:mb-0 sm:absolute sm:left-16 sm:top-4 text-sm">
                            {activity.time}
                          </div>
                          
                          {/* Activity Content */}
                          <div className="sm:pt-5">
                            <h4 className="text-gray-900 font-medium mb-2">{activity.title}</h4>
                            <p className="text-gray-700 text-sm">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Travel Tips */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Travel Tips for Your Itinerary</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Consider the weather during your travel dates when planning daily activities.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Download maps or use a navigation app for efficient travel between attractions.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Book popular attractions and day trips in advance to avoid disappointment.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Allow flexibility in your schedule for unexpected discoveries or weather changes.</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'budget':
        // Convert USD to INR (1 USD ≈ 83 INR)
        const exchangeRate = 83;
        
        // Check if the budget has different tiers
        const hasBudgetTiers = typeof sectionData.totalCost === 'object' && 
          sectionData.totalCost !== null && sectionData.totalCost.budget;
        
        // Function to convert cost to INR based on value type
        const convertCostToINR = (cost) => {
          if (typeof cost === 'number') {
            return (cost * exchangeRate).toLocaleString('en-IN');
          } else if (typeof cost === 'string') {
            return cost; // Return as is if it's a string (like "Variable")
          } else if (typeof cost === 'object' && cost !== null) {
            // Handle object with budget tiers
            const result = {};
            for (const tier in cost) {
              if (typeof cost[tier] === 'number') {
                result[tier] = (cost[tier] * exchangeRate).toLocaleString('en-IN');
              } else {
                result[tier] = cost[tier];
              }
            }
            return result;
          }
          return 'Price not available';
        };
        
        // Get total cost for each tier in INR
        const totalCostINR = convertCostToINR(sectionData.totalCost);
        
        return (
          <div className="space-y-8">
            {/* Budget Summary */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <h3 className="text-xl font-semibold mb-3 text-green-700 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <FaMoneyBillWave className="text-green-600 text-sm" />
                </span>
                Budget Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">{sectionData.summary}</p>
            </div>
            
            {/* Total Cost Cards */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <FaMoneyBillWave className="text-gray-600 text-sm" />
                </span>
                Total Estimated Cost
              </h3>
              
              {hasBudgetTiers ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Budget Tier */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white">
                      <h3 className="text-xl font-semibold">Budget Option</h3>
                      <p className="text-white/80 text-sm">basic & affordable</p>
                    </div>
                    <div className="p-5">
                      <p className="text-xl font-bold text-gray-900">₹{totalCostINR.budget}</p>
                      <p className="text-sm text-gray-500">${sectionData.totalCost.budget.toLocaleString()} USD</p>
                    </div>
                  </div>
                  
                  {/* Mid-range Tier */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md transform scale-105 z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xl font-semibold">Mid-range Option</h3>
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          Recommended
                        </span>
                      </div>
                      <p className="text-white/80 text-sm">balance of comfort & value</p>
                    </div>
                    <div className="p-5">
                      <p className="text-xl font-bold text-gray-900">₹{totalCostINR.midrange}</p>
                      <p className="text-sm text-gray-500">${sectionData.totalCost.midrange.toLocaleString()} USD</p>
                    </div>
                  </div>
                  
                  {/* Luxury Tier */}
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                    <div className="bg-gradient-to-r from-purple-500 to-fuchsia-600 p-5 text-white">
                      <h3 className="text-xl font-semibold">Luxury Option</h3>
                      <p className="text-white/80 text-sm">premium experience</p>
                    </div>
                    <div className="p-5">
                      <p className="text-xl font-bold text-gray-900">₹{totalCostINR.luxury}</p>
                      <p className="text-sm text-gray-500">${sectionData.totalCost.luxury.toLocaleString()} USD</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5 text-white">
                    <h3 className="text-xl font-semibold">Total Estimated Cost</h3>
                    <p className="text-white/80 text-sm">for your entire trip</p>
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        ₹{typeof totalCostINR === 'string' ? totalCostINR : totalCostINR.toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${typeof sectionData.totalCost === 'number' ? sectionData.totalCost.toLocaleString() : sectionData.totalCost} USD
                      </p>
                    </div>
                    <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      Standard estimate
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Cost Breakdown */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                  <FaMoneyBillWave className="text-gray-600 text-sm" />
                </span>
                Cost Breakdown
              </h3>
              
              {/* Tabs for selecting budget tier */}
              {hasBudgetTiers && (
                <div className="mb-6 flex justify-center border-b border-gray-200">
                  {['budget', 'midrange', 'luxury'].map((tier, index) => (
                    <button
                      key={tier}
                      onClick={() => {}} // For future functionality if needed
                      className={`px-6 py-3 font-medium text-sm capitalize ${
                        index === 1 // Highlight midrange by default
                          ? 'text-indigo-600 border-b-2 border-indigo-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="space-y-4">
                {sectionData.breakdown.map((item, index) => {
                  // Check if cost is a tiered object or a simple value
                  const isTieredCost = typeof item.cost === 'object' && item.cost !== null && !Array.isArray(item.cost);
                  // Use midrange as the default tier to display
                  const displayCost = isTieredCost ? item.cost.midrange : item.cost;
                  // Convert to INR if it's a number
                  const costInINR = typeof displayCost === 'number' 
                    ? displayCost * exchangeRate 
                    : null;
                  
                  // Calculate percentage for the progress bar (using midrange as default)
                  const totalForPercentage = hasBudgetTiers 
                    ? sectionData.totalCost.midrange 
                    : (typeof sectionData.totalCost === 'number' ? sectionData.totalCost : 0);
                  
                  const percentage = typeof displayCost === 'number' && totalForPercentage 
                    ? (displayCost / totalForPercentage) * 100 
                    : 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="text-gray-800 font-medium">{item.category}</h4>
                        
                        {isTieredCost ? (
                          <div className="bg-gray-100 rounded-lg p-2 grid grid-cols-3 gap-3 text-xs">
                            {Object.entries(item.cost).map(([tier, tierCost]) => (
                              <div key={tier} className="text-center">
                                <p className="font-semibold text-gray-500 uppercase">{tier}</p>
                                <p className="font-medium text-gray-900">
                                  {typeof tierCost === 'number' 
                                    ? `₹${(tierCost * exchangeRate).toLocaleString('en-IN')}` 
                                    : tierCost}
                                </p>
                                {typeof tierCost === 'number' && (
                                  <p className="text-gray-500">${tierCost.toLocaleString()}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-right">
                            {costInINR !== null ? (
                              <>
                                <p className="text-lg font-semibold text-gray-900">₹{costInINR.toLocaleString('en-IN')}</p>
                                <p className="text-xs text-gray-500">${displayCost} USD</p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-700">{displayCost}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {typeof displayCost === 'number' && (
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-teal-500 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Budget Disclaimer</h3>
              <p className="text-gray-700 text-sm">{sectionData.disclaimer}</p>
              
              <div className="mt-4 bg-white p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Budget Saving Tips:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-600">Consider staying in budget accommodations or hostels to reduce costs.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-600">Use public transportation instead of taxis when possible.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-600">Eat at local street food vendors or inexpensive restaurants.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-500 mr-2">•</span>
                    <span className="text-gray-600">Look for free or discounted attractions and activities.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Exchange Rate Note */}
            <div className="text-center text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
              <p>Exchange rate: 1 USD = ₹{exchangeRate} INR (Approximate)</p>
              <p className="mt-1">Prices may vary based on currency fluctuations and season.</p>
            </div>
          </div>
        );
        
      case 'events':
        return (
          <div className="space-y-8">
            {/* Events Section */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-100">
              <h3 className="text-xl font-semibold mb-4 text-purple-700 flex items-center">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                  <FaCalendarAlt className="text-purple-600 text-sm" />
                </span>
                Local Events
              </h3>
              
              {sectionData.events.length > 0 ? (
                <div className="space-y-4">
                  {sectionData.events.map((event, index) => (
                    <div key={index} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                        <h4 className="text-lg font-semibold text-purple-800">{event.name}</h4>
                        <div className="text-center sm:text-right">
                          <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {event.date}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700">{event.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No specific events found for your travel dates. Check local listings closer to your trip.</p>
              )}
            </div>
            
            {/* Activities Section with Tabs */}
            <div>
              <h3 className="text-xl font-semibold mb-6 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaMapMarkedAlt className="text-indigo-600 text-sm" />
                </span>
                Recommended Activities
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sectionData.activities.map((activity, index) => {
                  // Determine icon based on activity type
                  let icon;
                  let color;
                  
                  if (activity.type.toLowerCase().includes('cultural')) {
                    icon = <FaStar className="text-amber-500" />;
                    color = 'amber';
                  } else if (activity.type.toLowerCase().includes('adventure')) {
                    icon = <FaMapMarkedAlt className="text-green-500" />;
                    color = 'green';
                  } else {
                    icon = <FaLightbulb className="text-blue-500" />;
                    color = 'blue';
                  }
                  
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 border border-gray-100"
                    >
                      <div className={`p-4 border-b border-gray-100 flex items-center justify-between`}>
                        <div className="flex items-center">
                          <span className={`w-8 h-8 rounded-full bg-${color}-100 flex items-center justify-center mr-3`}>
                            {icon}
                          </span>
                          <h4 className="font-medium text-gray-900">{activity.name}</h4>
                        </div>
                        <span className={`px-3 py-1 rounded-full bg-${color}-50 text-${color}-700 text-xs font-medium`}>
                          {activity.type}
                        </span>
                      </div>
                      <div className="p-4 text-gray-700 text-sm">
                        {activity.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Guided Tours Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaUsers className="text-indigo-600 text-sm" />
                </span>
                Recommended Guided Tours
              </h3>
              
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-3">
                  {sectionData.tours.map((tour, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg hover:bg-indigo-50/50 transition-colors">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-800 font-semibold text-sm mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{tour}</p>
                        <button className="mt-2 text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors">
                          Inquire About Tour
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Planning Tip */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Activity Planning Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Book popular activities and tours in advance, especially during peak tourist season.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Consider the weather when planning outdoor activities - remember Mumbai can be hot and humid, with monsoon season from June to September.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Dress appropriately for cultural sites and religious venues - modest clothing that covers shoulders and knees is often required.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Always carry water, sunscreen, and comfortable walking shoes for day-long explorations.</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      case 'accommodation':
        // Helper function to convert price ranges from USD to INR
        const convertPriceRangeToINR = (priceRange) => {
          // Extract numbers from string like "$30 - $70 per night"
          const numbers = priceRange.match(/\d+/g);
          if (!numbers || numbers.length < 2) return 'Price on request';
          
          // Convert to INR (1 USD ≈ 83 INR)
          const exchangeRate = 83;
          const lowerPrice = parseInt(numbers[0]) * exchangeRate;
          const higherPrice = parseInt(numbers[1]) * exchangeRate;
          
          // Format with Indian numbering system
          return `₹${lowerPrice.toLocaleString('en-IN')} - ₹${higherPrice.toLocaleString('en-IN')} per night`;
        };
        
        return (
          <div className="space-y-8">
            {/* Accommodation Introduction */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <FaHotel className="text-blue-600 text-sm" />
                </span>
                Accommodation Options
              </h3>
              <p className="text-gray-700">
                We've curated the best accommodation options to suit various budgets and preferences.
                All prices are approximate and may vary based on season, availability, and special offers.
              </p>
            </div>
            
            {/* Accommodation Options */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {sectionData.options.map((option, index) => {
                // Determine card style based on accommodation type
                let gradientColors, iconBg, iconColor;
                
                if (option.type.toLowerCase().includes('budget')) {
                  gradientColors = 'from-emerald-500 to-teal-600';
                  iconBg = 'bg-emerald-100';
                  iconColor = 'text-emerald-600';
                } else if (option.type.toLowerCase().includes('mid')) {
                  gradientColors = 'from-blue-500 to-indigo-600';
                  iconBg = 'bg-blue-100';
                  iconColor = 'text-blue-600';
                } else {
                  gradientColors = 'from-purple-500 to-fuchsia-600';
                  iconBg = 'bg-purple-100';
                  iconColor = 'text-purple-600';
                }
                
                // Convert price range to INR
                const inrPriceRange = convertPriceRangeToINR(option.priceRange);
                
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Header */}
                    <div className={`p-5 bg-gradient-to-r ${gradientColors} text-white`}>
                      <div className="flex items-center mb-3">
                        <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center mr-3`}>
                          <FaHotel className={`${iconColor}`} />
                        </div>
                        <h3 className="text-xl font-semibold">{option.type}</h3>
                      </div>
                      <div className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm">
                        <p className="font-semibold">{inrPriceRange}</p>
                        <p className="text-xs opacity-80">Original: {option.priceRange}</p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5">
                      <p className="text-gray-700 mb-4">{option.description}</p>
                      
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">Recommended Places</h4>
                      <ul className="space-y-2">
                        {option.recommendations.map((hotel, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-800">{hotel}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <button className="w-full mt-5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all text-sm font-medium">
                        View Booking Options
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Accommodation Tips */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Accommodation Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Book accommodations well in advance for better rates, especially during peak tourist season.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Consider location relative to the attractions you plan to visit to minimize travel time.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Many hotels offer special packages that include meals or local experiences - ask about these when booking.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Read recent reviews to ensure the accommodation matches your expectations for cleanliness and service.</span>
                </li>
              </ul>
            </div>
            
            {/* Exchange Rate Note */}
            <div className="text-center text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
              <p>Exchange rate: 1 USD = ₹83 INR (Approximate)</p>
              <p className="mt-1">Prices may vary based on currency fluctuations, season, and availability.</p>
            </div>
          </div>
        );

      case 'food':
        return (
          <div className="space-y-8">
            {/* Cuisine Overview */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
              <h3 className="text-xl font-semibold mb-3 text-amber-700 flex items-center">
                <span className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                  <FaUtensils className="text-amber-600 text-sm" />
                </span>
                Local Cuisine
              </h3>
              <p className="text-gray-700 leading-relaxed">{sectionData.cuisine}</p>
            </div>
            
            {/* Must-Try Dishes */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-2">
                  <FaUtensils className="text-red-600 text-sm" />
                </span>
                Must-Try Dishes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectionData.dishes.map((dish, index) => {
                  // Split the dish string into name and description
                  const [name, description] = dish.split(':').map(part => part.trim());
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 border border-gray-100"
                    >
                      <div className="h-32 bg-gradient-to-b from-orange-400 to-red-500 p-4 flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-20" 
                             style={{backgroundImage: `url(https://source.unsplash.com/300x200/?${encodeURIComponent(name)}+food+indian)`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <h4 className="text-white text-lg font-semibold text-center relative z-10 drop-shadow-md">{name}</h4>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-700">{description || "A local delicacy worth trying."}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Recommended Restaurants */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-xl font-semibold mb-5 text-blue-700 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <FaUtensils className="text-blue-600 text-sm" />
                </span>
                Recommended Restaurants
              </h3>
              
              <div className="space-y-4">
                {sectionData.restaurants.map((restaurant, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="md:flex">
                      <div className="md:w-1/4 p-4 border-r border-gray-100 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <h4 className="text-gray-900 font-semibold mb-1">{restaurant.name}</h4>
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                          {restaurant.type}
                        </span>
                      </div>
                      <div className="md:w-3/4 p-4">
                        <p className="text-gray-700">{restaurant.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dietary Information */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
              <h3 className="text-xl font-semibold mb-3 text-green-700 flex items-center">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                  <FaLeaf className="text-green-600 text-sm" />
                </span>
                Dietary Information
              </h3>
              <p className="text-gray-700 leading-relaxed">{sectionData.dietary}</p>
              
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <FaCheck className="text-green-600 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700">Many vegetarian options</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <FaLeaf className="text-green-600 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700">Vegan dishes available</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                    <FaExclamation className="text-amber-600 text-xs" />
                  </div>
                  <span className="text-sm text-gray-700">Communicate allergies</span>
                </div>
              </div>
            </div>
            
            {/* Food Tips */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Food & Dining Tips</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Street food is delicious but choose vendors with good hygiene practices and high customer turnover.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Many restaurants offer "thali" - a platter with multiple dishes, perfect for sampling various flavors.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Popular restaurants may require reservations, especially during peak tourist season.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-500 mr-2">•</span>
                  <span className="text-gray-700">Carry small denominations of cash for street food vendors who may not accept cards.</span>
                </li>
              </ul>
            </div>
          </div>
        );

      case 'transportation':
        // Helper function to parse markdown-like content
        const parseMarkdownText = (text) => {
          if (!text) return '';
          
          // Handle bullet points
          let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          
          // Handle line breaks
          formattedText = formattedText.replace(/\n\n/g, '<br/><br/>');
          
          // Handle bullet lists
          formattedText = formattedText.replace(/\n\* /g, '<br/>• ');
          
          return formattedText;
        };
        
        return (
          <div className="space-y-8">
            {/* Getting There Section */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <h3 className="text-xl font-semibold mb-3 text-blue-700 flex items-center">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                  <FaPlane className="text-blue-600 text-sm" />
                </span>
                Getting to {destination}
              </h3>
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdownText(sectionData.gettingThere) }}
              />
            </div>
            
            {/* Nearest Airport and Distances */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
                <h3 className="text-xl font-semibold flex items-center">
                  <FaPlane className="mr-2" />
                  Nearest Airport
                </h3>
                <p className="text-lg mt-2 font-medium">{sectionData.nearestAirport}</p>
              </div>
              
              <div className="p-5">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Distances to Key Locations</h4>
                <div className="space-y-2">
                  {Object.entries(sectionData.distance).map(([place, distance], index) => (
                    <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-gray-800 font-medium">{place}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Local Transport Options */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center">
                <span className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                  <FaMapMarkedAlt className="text-emerald-600 text-sm" />
                </span>
                Local Transportation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Transport Description */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: parseMarkdownText(sectionData.localTransport) }}
                  />
                </div>
                
                {/* Transport Options */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <h4 className="text-lg font-medium text-gray-800 mb-4">Available Transport Options</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {sectionData.transportOptions.map((option, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                          {option.toLowerCase().includes('bus') && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                          {option.toLowerCase().includes('taxi') && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                          {option.toLowerCase().includes('auto') && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                          {option.toLowerCase().includes('car') && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                          {option.toLowerCase().includes('train') && <FaPlane className="text-indigo-600 text-sm" />}
                          {option.toLowerCase().includes('ferr') && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                          {!option.toLowerCase().match(/(bus|taxi|auto|car|train|ferr)/) && <FaMapMarkedAlt className="text-indigo-600 text-sm" />}
                        </div>
                        <span className="text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Travel Tips */}
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <h3 className="text-lg font-semibold mb-3 text-amber-700">Transportation Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionData.tips.map((tip, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-white hover:bg-amber-50/50 transition-colors">
                    <span className="text-amber-500 mr-3 mt-0.5 bg-amber-50 rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        // Check if the section data exists and render it as JSON for now
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">
              {sections.find(s => s.id === section)?.title || 'Section Information'}
            </h3>
            <div className="space-y-6">
              {Object.entries(sectionData).map(([key, value]) => {
                // Skip rendering internal/metadata keys
                if (key.startsWith('_')) return null;
                
                // Format the key title for display
                const formattedTitle = key.charAt(0).toUpperCase() + 
                  key.slice(1).replace(/([A-Z])/g, ' $1').trim();
                
                // Handle different types of content
                if (Array.isArray(value)) {
                  return (
                    <div key={key} className="p-5 rounded-xl bg-white shadow-sm border border-gray-200">
                      <h4 className="text-lg font-medium text-indigo-600 capitalize mb-3">{formattedTitle}</h4>
                      
                      {/* If array contains objects (like restaurants, hotels, events) */}
                      {value.length > 0 && typeof value[0] === 'object' && value[0] !== null ? (
                        <div className="space-y-4">
                          {value.map((item, i) => (
                            <div key={i} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                              {Object.entries(item).map(([itemKey, itemValue]) => {
                                // Format item key for display
                                const formattedItemKey = itemKey.charAt(0).toUpperCase() + 
                                  itemKey.slice(1).replace(/([A-Z])/g, ' $1').trim();
                                
                                return (
                                  <div key={itemKey} className="mb-2">
                                    <span className="text-sm font-medium text-gray-700">{formattedItemKey}: </span>
                                    <span className="text-gray-600">
                                      {typeof itemValue === 'string' 
                                        ? itemValue 
                                        : JSON.stringify(itemValue)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* For arrays of strings */
                        <ul className="list-disc pl-5 space-y-2">
                          {value.map((item, i) => (
                            <li key={i} className="text-gray-700">
                              {typeof item === 'string' ? item : JSON.stringify(item)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                } else if (typeof value === 'object' && value !== null) {
                  return (
                    <div key={key} className="p-5 rounded-xl bg-white shadow-sm border border-gray-200">
                      <h4 className="text-lg font-medium text-indigo-600 capitalize mb-3">{formattedTitle}</h4>
                      
                      {/* Render nested properties */}
                      <div className="space-y-3">
                        {Object.entries(value).map(([nestedKey, nestedValue]) => {
                          // Format nested key for display
                          const formattedNestedKey = nestedKey.charAt(0).toUpperCase() + 
                            nestedKey.slice(1).replace(/([A-Z])/g, ' $1').trim();
                          
                          // Check if nested value is an array
                          if (Array.isArray(nestedValue)) {
                            return (
                              <div key={nestedKey} className="mb-4">
                                <h5 className="text-base font-medium text-gray-700 mb-2">{formattedNestedKey}</h5>
                                <ul className="list-disc pl-5 space-y-1">
                                  {nestedValue.map((item, i) => (
                                    <li key={i} className="text-gray-700">
                                      {typeof item === 'string' ? item : JSON.stringify(item)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          } else {
                            return (
                              <div key={nestedKey} className="mb-2">
                                <span className="text-sm font-medium text-gray-700">{formattedNestedKey}: </span>
                                <span className="text-gray-600">
                                  {typeof nestedValue === 'string' 
                                    ? nestedValue 
                                    : JSON.stringify(nestedValue)}
                                </span>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                } else {
                  // For string, number, boolean values
                  return (
                    <div key={key} className="p-5 rounded-xl bg-white shadow-sm border border-gray-200">
                      <h4 className="text-lg font-medium text-indigo-600 capitalize mb-2">{formattedTitle}</h4>
                      <p className="text-gray-700">{String(value)}</p>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        );
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
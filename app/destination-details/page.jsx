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

export default function DestinationDetails() {
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
      console.log('API Response for section:', section);
      console.log('Response data:', JSON.stringify(data, null, 2));
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
        console.log('Retry API Response for section:', section);
        console.log('Retry Response data:', JSON.stringify(data, null, 2));
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
        
      case 'accommodation':
        return (
          <div className="space-y-8">
            {sectionData.options.map((option, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-xl font-semibold text-indigo-700 flex items-center">
                    <FaHotel className="text-indigo-500 mr-2" />
                    {option.type}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">Price Range: {convertToINR(option.priceRange)}</p>
                </div>
                <div className="p-5">
                  <p className="mb-4 text-gray-700">{option.description}</p>
                  <h4 className="font-medium mb-3 text-gray-800">Recommendations:</h4>
                  <div className="space-y-2">
                    {option.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <span className="text-indigo-500 mr-2 mt-0.5">&bull;</span>
                        <span className="text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );
        
      case 'food':
        return (
          <div>
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <h3 className="text-xl font-semibold mb-3 text-indigo-700">Local Cuisine</h3>
              <p className="text-gray-700">{sectionData.cuisine}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700 flex items-center">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  <FaUtensils className="text-indigo-600 text-sm" />
                </span>
                Must-Try Dishes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionData.dishes.map((dish, index) => (
                  <div key={index} className="flex items-start p-3 rounded-lg bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                    <span className="text-indigo-500 mr-3 mt-0.5 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{dish}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">Recommended Restaurants</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sectionData.restaurants.map((rest, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    <h4 className="font-semibold text-lg text-gray-800">{rest.name}</h4>
                    <p className="text-indigo-600 text-sm mb-2">{rest.type}</p>
                    <p className="text-gray-600">{rest.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {sectionData.dietary && (
              <div className="p-6 rounded-xl bg-green-50 border border-green-100">
                <h3 className="text-xl font-semibold mb-3 text-green-700">Dietary Options</h3>
                <p className="text-gray-700">{sectionData.dietary}</p>
              </div>
            )}
          </div>
        );
        
      case 'itinerary':
        return (
          <div>
            <div className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 pl-6 py-4 pr-4">
              <p className="text-gray-700 leading-relaxed">{sectionData.intro}</p>
            </div>
            
            <div className="space-y-4">
              {sectionData.days.map((day, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3">
                    <h3 className="text-lg font-bold">Day {index + 1}: {day.title}</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {day.activities.map((activity, i) => (
                      <div key={i} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col space-y-1.5">
                          <span className="inline-block text-sm font-medium text-indigo-600 bg-indigo-50 rounded px-2.5 py-0.5 w-fit">
                            {activity.time}
                          </span>
                          <h4 className="font-bold text-gray-800">{activity.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="px-6 py-2 bg-gray-50 flex justify-between text-sm text-gray-500 border-t border-gray-100">
                    <span>{day.activities.length} activities</span>
                    <span className="text-indigo-600 font-medium">Full day</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-sm text-gray-500 italic">
              Note: This itinerary is a suggestion and can be modified based on your preferences and local conditions.
            </div>
          </div>
        );
        
      case 'budget':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Estimated Budget</h3>
              <p className="text-gray-700 mb-4">{sectionData.summary}</p>
              
              {/* Total Cost Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['budget', 'midrange', 'luxury'].map((tier) => (
                  <div key={tier} className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                    <h4 className="text-lg font-medium text-center mb-4 capitalize">{tier}</h4>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-600 mb-1">
                        {convertToINR(`$${sectionData.totalCost[tier]}`)}
                      </p>
                      <p className="text-gray-500">
                        for {guests} {parseInt(guests) === 1 ? 'person' : 'people'} • {getDuration()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <h4 className="font-semibold text-gray-800">Cost Breakdown</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 font-medium text-gray-600">Category</th>
                        <th className="text-right p-4 font-medium text-gray-600">Budget</th>
                        <th className="text-right p-4 font-medium text-gray-600">Mid-Range</th>
                        <th className="text-right p-4 font-medium text-gray-600">Luxury</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sectionData.breakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-4 text-gray-700">{item.category}</td>
                          <td className="p-4 text-right text-gray-700">
                            {convertToINR(`$${item.cost.budget}`)}
                          </td>
                          <td className="p-4 text-right text-gray-700">
                            {convertToINR(`$${item.cost.midrange}`)}
                          </td>
                          <td className="p-4 text-right text-gray-700">
                            {convertToINR(`$${item.cost.luxury}`)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="p-4 text-gray-800">Total</td>
                        <td className="p-4 text-right text-gray-800">
                          {convertToINR(`$${sectionData.totalCost.budget}`)}
                        </td>
                        <td className="p-4 text-right text-gray-800">
                          {convertToINR(`$${sectionData.totalCost.midrange}`)}
                        </td>
                        <td className="p-4 text-right text-gray-800">
                          {convertToINR(`$${sectionData.totalCost.luxury}`)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-sm text-amber-800">{sectionData.disclaimer}</p>
              </div>
            </div>
          </div>
        );
        
      case 'tips':
        return (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Best Time to Visit</h3>
              <p className="text-gray-700 mb-2">{sectionData.bestTime}</p>
              {sectionData.currentSeason && (
                <p className="italic text-indigo-600">{sectionData.currentSeason}</p>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3">Local Customs & Etiquette</h3>
              <p className="text-gray-700 mb-3">{sectionData.customs}</p>
              <ul className="space-y-2">
                {sectionData.etiquetteTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {sectionData.language && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3">Language Tips</h3>
                <p className="text-gray-700 mb-3">{sectionData.language.overview}</p>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Useful Phrases:</h4>
                  <ul className="space-y-1">
                    {sectionData.language.phrases.map((phrase, index) => (
                      <li key={index}>{phrase}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {sectionData.emergency && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Emergency Information</h3>
                <p className="text-gray-700 mb-3">{sectionData.emergency.info}</p>
                <ul className="space-y-1">
                  {sectionData.emergency.contacts.map((contact, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-indigo-500 mr-2">•</span>
                      <span>{contact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        
      case 'shopping':
        return (
          <div>
            <p className="text-gray-700 mb-6">{sectionData.overview}</p>
            
            <h3 className="text-xl font-semibold mb-4">Best Shopping Areas</h3>
            <div className="space-y-4 mb-6">
              {sectionData.shoppingAreas.map((area, index) => (
                <div key={index} className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold">{area.name}</h4>
                  <p className="text-gray-600 text-sm mb-1">{area.type}</p>
                  <p className="text-sm">{area.description}</p>
                </div>
              ))}
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Must-Buy Souvenirs</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectionData.souvenirs.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case 'transportation':
        return (
          <div className="space-y-6">
            {/* Getting There Overview */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500 p-6 rounded-r-xl">
              <h3 className="text-xl font-semibold mb-3 text-indigo-700">Getting There</h3>
              <p className="text-gray-700">{sectionData.gettingThere}</p>
            </div>

            {/* Nearest Airport */}
            {sectionData.nearestAirport && (
              <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                <div className="flex items-center mb-2">
                  <FaPlane className="text-indigo-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Nearest Airport</h3>
                </div>
                <p className="text-gray-700">{sectionData.nearestAirport}</p>
              </div>
            )}

            {/* Distances */}
            {sectionData.distance && Object.keys(sectionData.distance).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800">Distance from Major Cities</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {Object.entries(sectionData.distance).map(([city, distance], index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">{city}</span>
                        <span className="text-gray-600">{distance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Local Transport */}
            {sectionData.localTransport && (
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Local Transportation</h3>
                <p className="text-gray-700 mb-4">{sectionData.localTransport}</p>
                
                {sectionData.transportOptions && sectionData.transportOptions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Available Transport Options:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sectionData.transportOptions.map((option, index) => (
                        <div key={index} className="bg-gray-50 px-3 py-2 rounded text-sm text-gray-700">
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Transportation Tips */}
            {sectionData.tips && sectionData.tips.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-100">
                <div className="flex items-center mb-4">
                  <FaLightbulb className="text-amber-600 mr-2" />
                  <h3 className="text-lg font-semibold text-amber-800">Travel Tips</h3>
                </div>
                <ul className="space-y-2">
                  {sectionData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="text-amber-500 mr-2 mt-1.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show message if no transportation data is available */}
            {!sectionData.gettingThere && !sectionData.localTransport && !sectionData.tips && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6 inline-block">
                  <FaPlane className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Transportation information is currently being updated.</p>
                  <p className="text-gray-500 text-sm mt-2">Please check back later for detailed information about getting around {destination}.</p>
                </div>
              </div>
            )}
          </div>
        );
        
      case 'events':
        return (
          <div className="space-y-6">
            {/* Activities Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FaMapMarkedAlt className="mr-3" />
                  Things to Do in {destination}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-100">
                {sectionData.activities.map((activity, index) => (
                  <div key={index} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">{activity.name}</h4>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium">
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-gray-600">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Tours Section */}
            {sectionData.tours && sectionData.tours.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaMapMarkedAlt className="text-indigo-600 mr-2" />
                    Available Tours
                  </h3>
                </div>
                <div className="p-5 grid gap-3">
                  {sectionData.tours.map((tour, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{tour}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {sectionData.events && sectionData.events.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FaCalendarAlt className="text-indigo-600 mr-2" />
                    Events During Your Stay
                  </h3>
                </div>
                <div className="p-5">
                  {sectionData.events.map((event, index) => (
                    <div key={index} className="bg-amber-50/50 rounded-lg p-4 border border-amber-100">
                      <div className="flex items-start">
                        <div className="flex-grow">
                          <h4 className="font-medium text-amber-800 mb-2">{event.name}</h4>
                          <p className="text-gray-600">{event.description}</p>
                          {event.date !== "N/A" && (
                            <p className="text-amber-600 text-sm mt-2">Date: {event.date}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show message if no data is available */}
            {(!sectionData.activities || sectionData.activities.length === 0) && 
             (!sectionData.tours || sectionData.tours.length === 0) && 
             (!sectionData.events || sectionData.events.length === 0) && (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-lg p-6 inline-block">
                  <FaMapMarkedAlt className="text-4xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Activities and events information is currently being updated.</p>
                  <p className="text-gray-500 text-sm mt-2">Please check back later for things to do in {destination}.</p>
                </div>
              </div>
            )}
          </div>
        );
        
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

      {/* Search Bar - Fixed position with proper z-index */}
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

      {/* Quick Stats - Adjusted top padding */}
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
            {/* Sidebar Navigation - Now with visual improvements */}
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

            {/* Main Content Area - Now with better visual hierarchy */}
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
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaSpinner, FaCalendarAlt, FaMoneyBillWave, FaMapMarkedAlt, FaUtensils, FaPlane, FaHotel, FaShareAlt, FaCopy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton,
  FacebookIcon, TwitterIcon, WhatsappIcon } from 'react-share';

export default function SharedTrip() {
  const params = useParams();
  const { id } = params;
  
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSummary = async () => {
      if (!id) {
        setError('No trip ID provided');
        setLoading(false);
        return;
      }
    
      try {
        // Log the ID being fetched
        console.log('Fetching trip summary with ID:', id);
        
        const response = await fetch(`/api/trip-summary/${id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', response.status, errorData);
          throw new Error(`Failed to fetch trip summary: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Trip summary data received:', data.success);
        setSummary(data.summary);
      } catch (err) {
        console.error('Error fetching shared trip:', err);
        setError('Failed to load trip details. The shared trip may have expired or been removed.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSummary();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">Loading shared trip...</h2>
          <p className="text-gray-500 mt-2">Just a moment while we load this shared itinerary</p>
        </div>
      </div>
    );
  }
  
  if (error || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white p-4">
        <div className="max-w-md text-center">
          <div className="bg-red-100 p-5 rounded-xl mb-6">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-red-700">Something went wrong</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || 'This shared trip was not found or has expired.'}</p>
          <a href="/" className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Return to Home
          </a>
        </div>
      </div>
    );
  }
  
  const { destination, summary_text, place_info, budget_info, itinerary_info, created_at } = summary;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Hero Banner */}
      <div className="h-96 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0" 
          style={{ backgroundImage: `url(https://source.unsplash.com/1600x900/?${encodeURIComponent(destination)})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 via-purple-900/75 to-black/70 backdrop-blur-sm"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-end z-10 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-indigo-300 mb-2">Shared Trip Summary</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {destination}
              </h1>
              <p className="text-white/75 text-lg max-w-2xl">
                {summary_text.substring(0, 120)}...
              </p>
              
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FaCalendarAlt className="mr-2 text-white/75" />
                  <span className="text-white">
                    {new Date(created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <FacebookShareButton url={shareUrl} quote={`Check out this trip to ${destination}!`}>
                    <FacebookIcon size={32} round />
                  </FacebookShareButton>
                  <TwitterShareButton url={shareUrl} title={`Check out this trip to ${destination}!`}>
                    <TwitterIcon size={32} round />
                  </TwitterShareButton>
                  <WhatsappShareButton url={shareUrl} title={`Check out this trip to ${destination}!`}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard!');
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                    title="Copy link to clipboard"
                  >
                    <FaCopy className="text-gray-700" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 relative z-10">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Overview</h2>
            <p className="text-gray-700 whitespace-pre-line">{summary_text}</p>
          </div>
        </div>

        {/* Place Information */}
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mr-3">
              <FaMapMarkedAlt className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">About {destination}</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700">{place_info.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-5 rounded-xl border border-teal-100">
                <h3 className="font-semibold text-teal-700 mb-2">Best Time to Visit</h3>
                <p className="text-gray-700">{place_info.best_time_to_visit}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-700 mb-2">Language</h3>
                <p className="text-gray-700">{place_info.language}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                <h3 className="font-semibold text-purple-700 mb-2">Currency</h3>
                <p className="text-gray-700">{place_info.currency}</p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Highlights</h3>
            <ul className="space-y-1">
              {place_info.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-teal-500 mr-2">•</span>
                  <span className="text-gray-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Budget Information */}
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-xl p-6 md:p-8 mb-8 border border-emerald-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mr-3">
              <FaMoneyBillWave className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Budget Estimate</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-emerald-700 mb-2">Accommodation</h3>
              <p className="text-gray-700">{budget_info.accommodation}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-emerald-700 mb-2">Food</h3>
              <p className="text-gray-700">{budget_info.food}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-emerald-700 mb-2">Transportation</h3>
              <p className="text-gray-700">{budget_info.transportation}</p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="font-semibold text-emerald-700 mb-2">Activities</h3>
              <p className="text-gray-700">{budget_info.activities}</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 rounded-xl text-white shadow-md">
            <h3 className="font-semibold text-xl mb-2">Total Estimated Budget</h3>
            <p className="text-lg">{budget_info.total_estimate}</p>
          </div>
        </div>
        
        {/* Itinerary Information */}
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-xl p-6 md:p-8 border border-indigo-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-3">
              <FaCalendarAlt className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Suggested Itinerary</h2>
          </div>
          
          <p className="text-gray-700 mb-6">Recommended duration: {itinerary_info.recommended_days} days</p>
          
          <div className="space-y-6">
            {itinerary_info.days.map((day, index) => (
              <div key={index} className="border-l-4 border-indigo-500 pl-5 pb-6">
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">Day {day.day}: {day.title}</h3>
                <p className="text-gray-700 mb-3">{day.description}</p>
                <ul className="space-y-2 bg-white p-4 rounded-lg shadow-sm">
                  {day.activities.map((activity, actIndex) => (
                    <li key={actIndex} className="flex items-start">
                      <span className="text-indigo-500 mr-2 mt-1">•</span>
                      <span className="text-gray-700">{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-10 shadow-xl relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to plan your own trip?</h3>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Create your personalized travel itinerary with TripSage - AI-powered travel planning that makes exploring the world easier than ever.
              </p>
              <a 
                href="/" 
                className="inline-block bg-white text-indigo-700 px-8 py-4 rounded-lg font-medium hover:bg-indigo-50 transition-colors shadow-md"
              >
                Plan Your Trip Now
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} TripSage. All rights reserved.</p>
            <p className="mt-2">AI-powered travel planning made simple.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';
import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch, FaRobot } from 'react-icons/fa';
import StatsCard from './StatsCard';
import Link from 'next/link';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    place: '',
    date: '',
    guests: ''
  });

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative min-h-[110vh] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero-bg.jpg")',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center px-4 md:px-6">
          <div className="mb-12 md:mb-24 w-full max-w-7xl mt-48">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-russo text-white text-center leading-tight mb-6 md:mb-8 tracking-wide font-black">
              Explore the World's
              <span className="block mt-1 md:mt-2">
                Hidden Treasures
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white text-center max-w-3xl md:max-w-5xl mx-auto opacity-90 font-opensans px-4">
              Your journey to extraordinary destinations begins here. Let us guide your adventure.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-xl md:max-w-2xl md:backdrop-blur-md md:bg-white/10 rounded-full p-2 flex flex-col md:flex-row gap-3 font-opensans mx-4 mb-8 mt-8">
            {/* Place Input */}
            <div className="flex-1 min-w-0 flex items-center bg-white/20 rounded-full px-4 py-3">
              <FaMapMarkerAlt className="text-white text-lg md:text-xl flex-shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Where to?"
                className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm md:text-base"
                value={searchData.place}
                onChange={(e) => setSearchData({...searchData, place: e.target.value})}
              />
            </div>

            {/* Date Input */}
            <div className="flex-1 min-w-0 flex items-center bg-white/20 rounded-full px-4 py-3">
              <FaCalendarAlt className="text-white text-lg md:text-xl flex-shrink-0 mr-3" />
              <input
                type="date"
                className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm md:text-base [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
                value={searchData.date}
                onChange={(e) => setSearchData({...searchData, date: e.target.value})}
              />
            </div>

            {/* Guests Input */}
            <div className="flex-1 min-w-0 flex items-center bg-white/20 rounded-full px-4 py-3">
              <FaUsers className="text-white text-lg md:text-xl flex-shrink-0 mr-3" />
              <input
                type="number"
                placeholder="Guests"
                min="1"
                className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm md:text-base"
                value={searchData.guests}
                onChange={(e) => setSearchData({...searchData, guests: e.target.value})}
              />
            </div>

            {/* Search Button */}
            <button className="w-full md:w-auto h-[50px] flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 px-6">
              <FaSearch className="hidden md:block text-gray-900 text-xl" />
              <span className="md:hidden text-gray-900 font-semibold">Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="absolute left-0 right-0 bottom-0 translate-y-[60%] px-4 md:px-6 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatsCard 
              title="1M+"
              subtitle="Total Visits"
            />
            <StatsCard 
              title="5000+"
              subtitle="Total Places"
            />
            <StatsCard 
              title="Chat Guide"
              subtitle="Your Own Guide"
            />
            <StatsCard 
              title="4.9/5"
              subtitle="Customer Rating"
            />
          </div>
        </div>
      </div>

      {/* ChatGuide Banner */}
      <div className="absolute left-0 right-0 bottom-0 translate-y-[calc(120%)] md:translate-y-[calc(110%)] px-4 md:px-6">
        <div className="max-w-6xl mx-auto my-32">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#2B2E4A] to-[#1F1D36]">
            {/* Abstract Background Elements */}
            <div className="absolute inset-0">
              {/* Animated Circles */}
              <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-overlay blur-3xl animate-blob" />
              <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-overlay blur-3xl animate-blob animation-delay-2000" />
              <div className="absolute bottom-1/2 left-1/2 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-overlay blur-3xl animate-blob animation-delay-4000" />

              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                   style={{
                     backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                     backgroundSize: '32px 32px'
                   }}
              />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-12 p-8 md:p-16">
              {/* Left Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                  <FaRobot className="text-purple-300" />
                  <span className="text-white/90 text-sm font-medium">AI-Powered Assistant</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-russo text-white mb-6 leading-tight">
                  Plan Your Perfect Trip with
                  <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-indigo-300 to-blue-300">
                    ChatGuide AI
                  </span>
                </h2>
                
                <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto md:mx-0">
                  Get instant, personalized travel recommendations from our AI assistant. Discover hidden gems, local insights, and create your dream itinerary in minutes.
                </p>

                <Link 
                  href="/chat-guide"
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-1 mb-8 md:mb-0"
                >
                  <span className="text-lg">Start Your Journey</span>
                  <FaRobot className="text-2xl group-hover:rotate-12 transition-transform" />
                </Link>
              </div>

              {/* Right Image/Illustration */}
              <div className="flex-1 relative hidden md:block">
                <div className="relative w-full aspect-square max-w-lg mx-auto">
                  {/* Main Background Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" />
                  
                  {/* Abstract Art Composition */}
                  <div className="relative w-full h-full">
                    {/* Morphing Blobs */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-morph" />
                      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full mix-blend-overlay filter blur-xl opacity-70 animate-morph animation-delay-2000" />
                    </div>

                    {/* Glowing Lines */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-96 h-96">
                        {/* Rotating Gradient Lines */}
                        <div className="absolute inset-0 animate-spin-slow">
                          <div className="absolute top-0 left-1/2 h-full w-1 bg-gradient-to-b from-transparent via-white/50 to-transparent transform -translate-x-1/2 blur-sm" />
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-y-1/2 blur-sm" />
                        </div>
                        
                        {/* Pulsing Circles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative">
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping-slow" />
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping-slow animation-delay-2000" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping-slow animation-delay-4000" style={{ animationDuration: '4s' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute inset-0">
                      {/* Sacred Geometry Elements */}
                      <div className="absolute top-1/4 left-1/4 w-32 h-32">
                        <div className="absolute inset-0 border-4 border-white/30 rounded-lg transform rotate-45 animate-float" />
                        <div className="absolute inset-0 border-4 border-white/20 rounded-lg transform -rotate-45 animate-float animation-delay-2000" />
                      </div>
                      
                      {/* Glowing Orbs */}
                      <div className="absolute bottom-1/4 right-1/4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 blur-md animate-pulse" />
                        <div className="absolute inset-0 bg-white/30 rounded-full backdrop-blur-sm" />
                      </div>
                    </div>

                    {/* Sparkles */}
                    <div className="absolute inset-0">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                          style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>

                    {/* Central Focus */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 animate-pulse blur-md" />
                        <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-md" />
                        <div className="absolute inset-0 rounded-full border border-white/50 animate-ping" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Decorative Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 
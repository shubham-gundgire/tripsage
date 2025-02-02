'use client';
import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch } from 'react-icons/fa';
import StatsCard from './StatsCard';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    place: '',
    date: '',
    guests: ''
  });

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative h-screen w-full">
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
          <div className="mb-12 md:mb-24 w-full max-w-7xl mt-20">
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
          <div className="w-full max-w-xl md:max-w-2xl md:backdrop-blur-md md:bg-white/10 rounded-full p-2 flex flex-col md:flex-row gap-3 font-opensans mx-4 mb-20">
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
      <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 px-4 md:px-6 bg-transparent">
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
    </div>
  );
};

export default HeroSection; 
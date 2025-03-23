'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch, FaRobot, FaAngleDown } from 'react-icons/fa';
import StatsCard from './StatsCard';
import Link from 'next/link';

const HeroSection = () => {
  const router = useRouter();
  const [searchData, setSearchData] = useState({
    place: '',
    startDate: '',
    endDate: '',
    guests: '1'
  });
  
  const [activeField, setActiveField] = useState(null);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.date-dropdown-container') && !e.target.closest('.guest-dropdown-container')) {
        setShowDateDropdown(false);
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchData.place) return;
    
    const params = new URLSearchParams();
    params.append('destination', searchData.place);
    
    if (searchData.startDate) {
      params.append('startDate', searchData.startDate);
    }
    
    if (searchData.endDate) {
      params.append('endDate', searchData.endDate);
    }
    
    params.append('guests', searchData.guests || '1');
    
    router.push(`/destination-details?${params.toString()}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderDateDisplay = () => {
    if (!searchData.startDate && !searchData.endDate) return 'Select dates';
    
    return `${formatDate(searchData.startDate)} ${searchData.endDate ? '→ ' + formatDate(searchData.endDate) : ''}`;
  };

  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  const generateDaysForMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', date: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        day,
        date: date.toISOString().split('T')[0],
        isToday: today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
      });
    }
    
    return days;
  };

  const thisMonthDays = generateDaysForMonth(today.getFullYear(), today.getMonth());
  const nextMonthDays = generateDaysForMonth(nextMonth.getFullYear(), nextMonth.getMonth());

  const handleSelectDate = (dateString) => {
    // If no dates selected yet, set as start date
    if (!searchData.startDate) {
      setSearchData({ ...searchData, startDate: dateString });
      return;
    }
    
    // If start date is already set but not end date
    if (searchData.startDate && !searchData.endDate) {
      // If clicked date is before start date, make it the new start date
      if (dateString < searchData.startDate) {
        setSearchData({ ...searchData, startDate: dateString });
        return;
      }
      
      // Otherwise set it as end date
      setSearchData({ ...searchData, endDate: dateString });
      setShowDateDropdown(false);
      return;
    }
    
    // If both dates are set, start over with new start date
    setSearchData({ ...searchData, startDate: dateString, endDate: '' });
  };

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

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

          {/* Search Bar - New Design */}
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 mt-4 mb-24">
            <form onSubmit={handleSearch} className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 align-middle">
                {/* Destination Input */}
                <div 
                  className={`bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-all duration-200 ${activeField === 'destination' ? 'ring-2 ring-white/50' : ''}`}
                  onClick={() => setActiveField('destination')}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                      <FaMapMarkerAlt className="text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-white/80 text-xs font-medium">Destination</p>
                      <input
                        type="text"
                        placeholder="Where to?"
                        className="w-full bg-transparent text-white placeholder-white/50 outline-none text-sm md:text-base"
                        value={searchData.place}
                        onChange={(e) => setSearchData({...searchData, place: e.target.value})}
                        required
                        onFocus={() => setActiveField('destination')}
                        onBlur={() => setActiveField(null)}
                      />
                    </div>
                  </div>
                </div>

                {/* Date Range Input */}
                <div 
                  className={`md:col-span-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-all duration-200 date-dropdown-container ${activeField === 'dates' ? 'ring-2 ring-white/50' : ''}`}
                  onClick={() => {
                    setActiveField('dates');
                    setShowDateDropdown(true);
                    setShowGuestDropdown(false);
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                      <FaCalendarAlt className="text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-white/80 text-xs font-medium">Dates</p>
                      <div className="flex items-center justify-between">
                        <div className="text-white cursor-pointer py-1">
                          {renderDateDisplay()}
                        </div>
                        <FaAngleDown className={`text-white/80 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {showDateDropdown && (
                        <div className="absolute z-[100] mb-2 bg-white rounded-xl shadow-xl p-4 left-0 right-0 md:left-auto md:w-[600px] bottom-full">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Month */}
                            <div>
                              <div className="text-center font-medium mb-2 text-gray-700">
                                {monthNames[today.getMonth()]} {today.getFullYear()}
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {weekdays.map(day => (
                                  <div key={day} className="text-xs text-gray-500 font-medium py-1">{day}</div>
                                ))}
                                {thisMonthDays.map((day, index) => (
                                  <div 
                                    key={index}
                                    className={`p-1 text-sm rounded-full flex items-center justify-center ${
                                      !day.date ? '' :
                                      day.date === searchData.startDate ? 'bg-indigo-600 text-white' :
                                      day.date === searchData.endDate ? 'bg-purple-600 text-white' :
                                      day.date > searchData.startDate && day.date < searchData.endDate ? 'bg-indigo-100 text-indigo-800' :
                                      day.isToday ? 'border border-indigo-600 text-indigo-600' :
                                      'hover:bg-gray-100 cursor-pointer'
                                    } ${day.date && new Date(day.date) < today && !day.isToday ? 'text-gray-300 cursor-not-allowed' : ''}`}
                                    onClick={() => day.date && (new Date(day.date) >= today || day.isToday) ? handleSelectDate(day.date) : null}
                                  >
                                    {day.day}
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Next Month */}
                            <div>
                              <div className="text-center font-medium mb-2 text-gray-700">
                                {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {weekdays.map(day => (
                                  <div key={day} className="text-xs text-gray-500 font-medium py-1">{day}</div>
                                ))}
                                {nextMonthDays.map((day, index) => (
                                  <div 
                                    key={index}
                                    className={`p-1 text-sm rounded-full flex items-center justify-center ${
                                      !day.date ? '' :
                                      day.date === searchData.startDate ? 'bg-indigo-600 text-white' :
                                      day.date === searchData.endDate ? 'bg-purple-600 text-white' :
                                      day.date > searchData.startDate && day.date < searchData.endDate ? 'bg-indigo-100 text-indigo-800' :
                                      day.isToday ? 'border border-indigo-600 text-indigo-600' :
                                      'hover:bg-gray-100 cursor-pointer'
                                    }`}
                                    onClick={() => day.date ? handleSelectDate(day.date) : null}
                                  >
                                    {day.day}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-4 pt-3 border-t border-gray-200">
                            <button 
                              type="button"
                              className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchData({ ...searchData, startDate: '', endDate: '' });
                              }}
                            >
                              Clear dates
                            </button>
                            <button 
                              type="button"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDateDropdown(false);
                              }}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guests Input */}
                <div 
                  className={`relative bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 transition-all duration-200 guest-dropdown-container ${activeField === 'guests' ? 'ring-2 ring-white/50' : ''}`}
                  onClick={() => {
                    setActiveField('guests');
                    setShowGuestDropdown(!showGuestDropdown);
                    setShowDateDropdown(false);
                  }}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
                      <FaUsers className="text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-white/80 text-xs font-medium">Guests</p>
                      <div className="flex items-center justify-between">
                        <div className="text-white cursor-pointer py-1">
                          {searchData.guests} {parseInt(searchData.guests) === 1 ? 'Guest' : 'Guests'}
                        </div>
                        <FaAngleDown className={`text-white/80 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      
                      {showGuestDropdown && (
                        <div className="absolute z-[100] mb-2 bg-white rounded-xl shadow-xl py-2 w-full bottom-full">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <div
                              key={num}
                              className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                                parseInt(searchData.guests) === num ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSearchData({ ...searchData, guests: num.toString() });
                                setShowGuestDropdown(false);
                              }}
                            >
                              {num} {num === 1 ? 'Guest' : 'Guests'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Button - Now inline with other inputs */}
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-[50px] md:h-auto rounded-xl px-6 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  <FaSearch />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="absolute left-0 right-0 bottom-0 translate-y-[95%] md:translate-y-[70%] px-4 md:px-6 bg-transparent">
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
      <div className="absolute left-0 right-0 bottom-0 translate-y-[calc(130%)] md:translate-y-[calc(110%)] px-4 md:px-6">
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
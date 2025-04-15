'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaAngleDown } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function SearchBar({ className = '', defaultValues = {} }) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultValues.destination || '');
  const [startDate, setStartDate] = useState(defaultValues.startDate ? new Date(defaultValues.startDate) : null);
  const [endDate, setEndDate] = useState(defaultValues.endDate ? new Date(defaultValues.endDate) : null);
  const [guests, setGuests] = useState(defaultValues.guests || 1);
  const [activeField, setActiveField] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  // Close dropdowns when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.date-picker-container') && !e.target.closest('.guest-dropdown-container')) {
        setShowDatePicker(false);
        setShowGuestDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!destination) return;
    
    const params = new URLSearchParams();
    params.append('destination', destination);
    
    if (startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    
    if (endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }
    
    params.append('guests', guests);
    
    router.push(`/destination-details?${params.toString()}`);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return '';
    
    const formatDate = (date) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    return `${formatDate(startDate)} ${endDate ? '→ ' + formatDate(endDate) : ''}`;
  };

  return (
    <form onSubmit={handleSearch} className={`w-full relative overflow-visible ${className}`}>
      <div className="relative bg-white rounded-xl shadow-lg overflow-visible border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          {/* Destination Input */}
          <div 
            className={`md:col-span-5 px-5 py-4 ${activeField === 'destination' ? 'bg-indigo-50/40' : ''}`}
            onClick={() => setActiveField('destination')}
          >
            <div className="flex items-center h-full">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                <FaMapMarkerAlt />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-gray-500 text-xs font-medium">Destination</p>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="block w-full outline-none text-gray-800 text-base bg-transparent focus:ring-0 border-none p-0"
                  required
                  onFocus={() => setActiveField('destination')}
                  onBlur={() => setActiveField(null)}
                />
              </div>
            </div>
          </div>
          
          {/* Date Range Input */}
          <div 
            className={`md:col-span-4 px-5 py-4 cursor-pointer date-picker-container ${activeField === 'dates' ? 'bg-indigo-50/40' : ''}`}
            onClick={() => {
              setActiveField('dates');
              setShowDatePicker(true);
              setShowGuestDropdown(false);
            }}
          >
            <div className="flex items-center h-full">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                <FaCalendarAlt />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-gray-500 text-xs font-medium">Dates</p>
                <div className="relative">
                  <div className="cursor-pointer text-gray-900 py-1 flex items-center justify-between">
                    <span>{formatDateRange() || 'Select your dates'}</span>
                    <FaAngleDown className={`text-gray-400 ml-2 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showDatePicker && (
                    <div className="absolute top-full left-0 mt-2 z-[9999] bg-white rounded-lg shadow-xl p-2 border border-gray-100" style={{ width: '600px' }}>
                      <style jsx global>{`
                        .react-datepicker {
                          display: flex !important;
                          width: 100% !important;
                        }
                        .react-datepicker__month-container {
                          width: 50% !important;
                          max-width: 290px !important;
                        }
                      `}</style>
                      <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        minDate={new Date()}
                        monthsShown={2}
                        calendarClassName="side-by-side-calendar bg-white text-indigo-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Guests Input */}
          <div 
            className={`md:col-span-3 px-5 py-4 relative guest-dropdown-container ${activeField === 'guests' ? 'bg-indigo-50/40' : ''}`}
            onClick={() => {
              setActiveField('guests');
              setShowGuestDropdown(!showGuestDropdown);
              setShowDatePicker(false);
            }}
          >
            <div className="flex items-center h-full">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                <FaUsers />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-gray-500 text-xs font-medium">Guests</p>
                <div className="relative">
                  <div className="flex items-center justify-between cursor-pointer text-gray-900 py-1">
                    <span>{guests} {parseInt(guests) === 1 ? 'Guest' : 'Guests'}</span>
                    <FaAngleDown className={`text-gray-400 transition-transform ${showGuestDropdown ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {showGuestDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <div 
                          key={num} 
                          className={`px-4 py-2 cursor-pointer ${
                            parseInt(guests) === num ? 'bg-indigo-50 text-indigo-600 font-medium' : 'hover:text-indigo-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuests(num);
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
          </div>
        </div>
        
        {/* Search Button - For Mobile View */}
        <button
          type="submit"
          className="md:hidden w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium transition-shadow duration-300 flex items-center justify-center gap-2"
        >
          <FaSearch />
          <span>Search</span>
        </button>
        
        {/* Search Button - For Desktop View */}
        <button
          type="submit"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaSearch className="text-xl" />
        </button>
      </div>
    </form>
  );
} 
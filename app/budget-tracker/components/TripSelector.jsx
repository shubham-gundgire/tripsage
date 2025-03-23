'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BiListUl, BiPlus, BiCheck } from 'react-icons/bi';

export default function TripSelector({ 
  trips, 
  currentTripId, 
  onSelectTrip, 
  onCreateNewTrip 
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown && 
        buttonRef.current && 
        !buttonRef.current.contains(event.target) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Get the correct button position for the dropdown
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: `${Math.max(rect.width, 280)}px`,
    };
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <BiListUl className="mr-2" size={18} />
        Select Trip
      </button>
      
      {showDropdown && typeof document !== 'undefined' && 
        createPortal(
          <div 
            ref={dropdownRef}
            className="absolute bg-white shadow-2xl rounded-md z-[9999] border border-gray-200"
            style={{
              ...getDropdownPosition(),
              position: 'absolute',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              marginTop: '8px'
            }}
          >
            <ul className="max-h-60 overflow-auto py-1">
              {trips.map(trip => (
                <li key={trip.id}>
                  <button
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                      trip.id === currentTripId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                    }`}
                    onClick={() => {
                      onSelectTrip(trip.id);
                      setShowDropdown(false);
                    }}
                  >
                    <span>{trip.name}</span>
                    {trip.id === currentTripId && <BiCheck size={18} />}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 py-2 px-4">
              <button
                type="button"
                className="w-full text-left text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={() => {
                  setShowDropdown(false);
                  onCreateNewTrip();
                }}
              >
                <BiPlus className="inline mr-1" size={16} />
                Create New Trip
              </button>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
} 
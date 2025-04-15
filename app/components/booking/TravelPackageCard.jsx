'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaMapMarkerAlt, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';

export default function TravelPackageCard({ travelPackage }) {
  const router = useRouter();
  
  // Display limited inclusions/exclusions to avoid overcrowding
  const displayedIncludes = travelPackage.includes.slice(0, 3);
  const displayedExcludes = travelPackage.excludes.slice(0, 2);
  
  // Format price - Convert USD to INR
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    
    // Convert USD to INR (1 USD ≈ 83 INR)
    const inrPrice = price * 83;
    
    // Format in INR with ₹ symbol
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(inrPrice);
  };
  
  // Handle click to navigate to travel package details
  const handleCardClick = () => {
    router.push(`/bookings/travel/${travelPackage.id}`);
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative h-52 w-full">
        <Image
          src={travelPackage.images[0] || '/images/placeholder-travel.jpg'}
          alt={travelPackage.name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{travelPackage.name}</h3>
          <div className="flex items-center mt-1">
            <FaMapMarkerAlt className="mr-1 text-white/80" />
            <span className="text-sm">{travelPackage.destination}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex items-center text-gray-600 mb-3">
          <FaCalendarAlt className="mr-2 text-gray-400" />
          <span className="text-sm">{travelPackage.duration_days} Days</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{travelPackage.description}</p>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Package Includes:</h4>
          <ul className="space-y-1">
            {displayedIncludes.map((item, index) => (
              <li key={index} className="flex items-start text-xs">
                <FaCheck className="text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
            {travelPackage.includes.length > 3 && (
              <li className="text-xs text-indigo-600">
                +{travelPackage.includes.length - 3} more inclusions
              </li>
            )}
          </ul>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Not Included:</h4>
          <ul className="space-y-1">
            {displayedExcludes.map((item, index) => (
              <li key={index} className="flex items-start text-xs">
                <FaTimes className="text-red-500 mt-0.5 mr-1 flex-shrink-0" />
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
            {travelPackage.excludes.length > 2 && (
              <li className="text-xs text-gray-500">
                And {travelPackage.excludes.length - 2} other exclusions
              </li>
            )}
          </ul>
        </div>
        
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-xs">Price per person</span>
            <p className="text-xl font-bold text-purple-600">{formatPrice(travelPackage.price)}</p>
          </div>
          
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-colors text-sm">
            View Package
          </button>
        </div>
      </div>
    </div>
  );
} 
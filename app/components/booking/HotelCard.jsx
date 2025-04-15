'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaStar, FaMapMarkerAlt, FaWifi, FaSwimmingPool, FaSpa, FaUtensils } from 'react-icons/fa';

const AmenityIcon = ({ amenity }) => {
  const lowerAmenity = amenity.toLowerCase();
  
  if (lowerAmenity.includes('wi-fi')) return <FaWifi className="text-gray-600" title={amenity} />;
  if (lowerAmenity.includes('pool')) return <FaSwimmingPool className="text-gray-600" title={amenity} />;
  if (lowerAmenity.includes('spa')) return <FaSpa className="text-gray-600" title={amenity} />;
  if (lowerAmenity.includes('restaurant')) return <FaUtensils className="text-gray-600" title={amenity} />;
  
  return null;
};

export default function HotelCard({ hotel }) {
  const router = useRouter();
  
  // Display only first 4 amenities to avoid overcrowding
  const displayedAmenities = hotel.amenities.slice(0, 4);
  
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
  
  // Handle click to navigate to hotel details
  const handleCardClick = () => {
    router.push(`/bookings/hotel/${hotel.id}`);
  };
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative h-52 w-full">
        <Image
          src={hotel.images[0] || '/images/placeholder-hotel.jpg'}
          alt={hotel.name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 mr-2">{hotel.name}</h3>
          <div className="flex items-center bg-indigo-100 px-2 py-1 rounded-lg">
            <FaStar className="text-yellow-500 mr-1" />
            <span className="text-sm font-semibold">{hotel.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span className="text-sm">{hotel.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hotel.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {displayedAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs" title={amenity}>
              <AmenityIcon amenity={amenity} />
              {AmenityIcon({ amenity }) && <span className="ml-1">{amenity}</span>}
              {!AmenityIcon({ amenity }) && <span>{amenity}</span>}
            </div>
          ))}
          {hotel.amenities.length > 4 && (
            <div className="px-2 py-1 bg-gray-100 rounded-md text-xs">
              +{hotel.amenities.length - 4} more
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <div>
            <span className="text-gray-500 text-xs">From</span>
            <p className="text-xl font-bold text-indigo-600">{formatPrice(hotel.price_per_night)}</p>
            <span className="text-gray-500 text-xs">per night</span>
          </div>
          
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
} 
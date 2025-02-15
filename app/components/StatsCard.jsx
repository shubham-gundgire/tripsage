'use client';
import { FaUsers, FaMapMarkedAlt, FaRobot, FaStar } from 'react-icons/fa';

const getIcon = (title) => {
  switch (title) {
    case '1M+':
      return <FaUsers className="text-4xl md:text-5xl mb-3 text-blue-500" />;
    case '5000+':
      return <FaMapMarkedAlt className="text-4xl md:text-5xl mb-3 text-emerald-500" />;
    case 'Chat Guide':
      return <FaRobot className="text-4xl md:text-5xl mb-3 text-purple-500" />;
    case '4.9/5':
      return <FaStar className="text-4xl md:text-5xl mb-3 text-amber-500" />;
    default:
      return null;
  }
};

const StatsCard = ({ title, subtitle }) => {
  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 min-h-[160px] w-[95%] mx-auto">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Border gradient */}
      <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      {/* Content */}
      <div className="relative h-full py-6 px-4 flex flex-col items-center justify-center">
        {getIcon(title)}
        <h3 className="text-xl md:text-2xl font-russo text-gray-900 mb-2 font-black group-hover:text-indigo-600 transition-colors duration-300">{title}</h3>
        <p className="text-xs md:text-sm text-gray-600 font-opensans text-center group-hover:text-gray-900 transition-colors duration-300">{subtitle}</p>
      </div>
    </div>
  );
};

export default StatsCard; 
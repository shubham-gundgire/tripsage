'use client';

const StatsCard = ({ title, subtitle }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-6 px-4 flex flex-col items-center justify-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 min-h-[120px] w-[95%] mx-auto">
      <h3 className="text-xl md:text-2xl font-russo text-gray-900 mb-2 font-black">{title}</h3>
      <p className="text-xs md:text-sm text-gray-600 font-opensans text-center">{subtitle}</p>
    </div>
  );
};

export default StatsCard; 
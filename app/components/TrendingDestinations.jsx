'use client';

const DestinationCard = ({ image, place, location, className }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl group ${className}`}>
      <img 
        src={image} 
        alt={place}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg md:text-xl font-russo mb-1">{place}</h3>
        <p className="text-xs md:text-sm font-opensans text-white/90">{location}</p>
      </div>
    </div>
  );
};

const TrendingDestinations = () => {
  return (
    <section className="py-20 px-4 md:px-6 mt-[900px] md:mt-[850px] ">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-6 md:mb-0">
            <h4 className="text-md md:text-base text-gray-600 font-opensans mb-2">Best location</h4>
            <h2 className="text-4xl  lg:text-5xl font-russo text-gray-900">Indian Tourism</h2>
          </div>
          <p className="text-base md:text-lg text-gray-600 font-opensans max-w-xl">
            Discover the rich heritage, breathtaking landscapes, and diverse culture of incredible India.
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="space-y-4 md:space-y-3">
          {/* First Row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-3">
            <DestinationCard
              image="https://images.pexels.com/photos/1603650/pexels-photo-1603650.jpeg?auto=compress&cs=tinysrgb&w=600"
              place="Taj Mahal"
              location="Agra, Uttar Pradesh"
              className="w-full md:w-[40%] h-[280px] md:h-[300px]"
            />
            <DestinationCard
              image="https://images.pexels.com/photos/2439787/pexels-photo-2439787.jpeg?auto=compress&cs=tinysrgb&w=600"
              place="Dal Lake"
              location="Srinagar, Kashmir"
              className="w-full md:w-[60%] h-[280px] md:h-[300px]"
            />
          </div>

          {/* Second Row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-3">
            <DestinationCard
              image="https://images.pexels.com/photos/28771906/pexels-photo-28771906/free-photo-of-lush-green-tea-plantations-in-munnar-hills.jpeg?auto=compress&cs=tinysrgb&w=600"
              place="Tea Gardens"
              location="Munnar, Kerala"
              className="w-full md:w-[60%] h-[280px] md:h-[300px]"
            />
            <DestinationCard
              image="https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=600"
              place="Radhanagar Beach"
              location="Havelock, Andaman"
              className="w-full md:w-[40%] h-[280px] md:h-[300px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingDestinations; 
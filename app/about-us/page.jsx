'use client';
import { FaUsers, FaChevronRight, FaGlobe, FaLaptop, FaHandshake, FaPaperPlane } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Aarav Sharma",
      role: "Founder & CEO",
      bio: "Travel enthusiast with 10+ years in the travel tech industry. Founded TripSage to make personalized travel planning accessible to everyone.",
      imgUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Priya Patel",
      role: "Chief Product Officer",
      bio: "Former travel consultant with a passion for UX design. Leads our product development with a focus on intuitive, user-friendly experiences.",
      imgUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Raj Malhotra",
      role: "Head of Technology",
      bio: "AI specialist with experience at leading tech companies. Oversees our recommendation engine and travel planning algorithms.",
      imgUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
    },
    {
      name: "Ananya Desai",
      role: "Travel Content Director",
      bio: "Travel writer and photographer who has visited over 50 countries. Ensures our destination information is accurate and inspiring.",
      imgUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Header with breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <FaChevronRight className="mx-2 text-xs text-gray-400" />
          <span className="text-gray-700">About Us</span>
        </div>

        <div className="flex items-center justify-center mb-14">
          <div className="bg-indigo-100 p-3 rounded-full mr-5">
            <FaUsers className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">About TripSage</h1>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-10">
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3">Our Story</h2>
              <p className="mt-6 text-gray-700 leading-relaxed">
                TripSage was born from a simple idea: travel planning should be personalized, 
                effortless, and inspiring. Founded in 2020, our platform combines cutting-edge 
                technology with deep travel expertise to create a new kind of travel planning experience.
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                We started as a small team of travel enthusiasts who were frustrated with the 
                fragmented nature of travel planning. Why should travelers have to visit dozens 
                of sites to plan the perfect trip? Why couldn't technology make personalized 
                recommendations based on individual preferences?
              </p>
              <p className="mt-4 text-gray-700 leading-relaxed">
                Today, TripSage helps thousands of travelers create memorable journeys tailored 
                to their unique interests, budgets, and travel styles. We're passionate about 
                unlocking new destinations and experiences for our users, making travel planning 
                as enjoyable as the journey itself.
              </p>
            </div>
            <div className="md:w-1/2 bg-indigo-600 flex items-center justify-center relative min-h-[300px]">
              <Image 
                src="https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=800&auto=format&fit=crop" 
                alt="Team working together"
                layout="fill"
                objectFit="cover"
                className="mix-blend-overlay opacity-40"
              />
              <div className="relative z-10 p-10 text-center">
                <h3 className="text-white text-3xl font-bold mb-4">Our Mission</h3>
                <p className="text-white text-lg">
                  To empower travelers with personalized, intelligent travel planning that brings 
                  joy to every step of the journey, from dreaming to experiencing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values Section */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <FaGlobe className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Cultural Respect</h3>
            <p className="text-gray-600">
              We believe in promoting responsible travel that respects local cultures, 
              traditions, and environments. Our recommendations aim to foster meaningful 
              connections between travelers and destinations.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <FaLaptop className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Innovation</h3>
            <p className="text-gray-600">
              We're continuously exploring new technologies and ideas to improve the travel 
              planning experience. From AI-powered recommendations to intuitive interfaces, 
              we're pushing boundaries.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-6">
              <FaHandshake className="text-2xl text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Inclusivity</h3>
            <p className="text-gray-600">
              Travel is for everyone. We strive to create experiences that cater to diverse 
              needs, interests, and abilities, ensuring that our platform serves all travelers.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-48 relative">
                <Image 
                  src={member.imgUrl} 
                  alt={member.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                <p className="text-indigo-600 text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return to Homepage Button */}
      <div className="flex justify-center">
        <Link href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md">
          <span>Return to Homepage</span>
          <FaChevronRight className="ml-2 text-xs" />
        </Link>
      </div>
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 px-4 md:px-6 py-4 transition-all duration-300 ${
      isScrolled ? 'backdrop-blur-md bg-black/30' : ''
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-russo text-white tracking-wider font-black">
          TripSage
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white text-2xl z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:block">
          <div className="backdrop-blur-md bg-white/10 rounded-full px-6 py-2 border border-white/20">
            <ul className="flex space-x-8 font-opensans">
              <li>
                <Link href="/destinations" className="text-white hover:text-gray-200 transition">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-white hover:text-gray-200 transition">
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-white hover:text-gray-200 transition">
                  Places
                </Link>
              </li>
              <li>
                <Link href="/chat-guide" className="text-white hover:text-gray-200 transition">
                  ChatGuide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex space-x-4 font-opensans">
          <button className="px-4 py-2 text-white hover:text-gray-200 transition">
            Login
          </button>
          <button className="px-4 py-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 fixed top-0 right-0 h-screen w-full md:hidden bg-black/95 backdrop-blur-lg`}>
          <div className="flex flex-col items-center justify-center h-full font-opensans">
            <ul className="flex flex-col space-y-8 text-center mb-12">
              <li>
                <Link href="/destinations" className="text-white text-xl hover:text-gray-200 transition" onClick={() => setIsMenuOpen(false)}>
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-white text-xl hover:text-gray-200 transition" onClick={() => setIsMenuOpen(false)}>
                  Blogs
                </Link>
              </li>
              <li>
                <Link href="/places" className="text-white text-xl hover:text-gray-200 transition" onClick={() => setIsMenuOpen(false)}>
                  Places
                </Link>
              </li>
              <li>
                <Link href="/chat-guide" className="text-white text-xl hover:text-gray-200 transition" onClick={() => setIsMenuOpen(false)}>
                  ChatGuide
                </Link>
              </li>
            </ul>
            <div className="flex flex-col space-y-4">
              <button className="px-8 py-3 text-white hover:text-gray-200 transition text-xl" onClick={() => setIsMenuOpen(false)}>
                Login
              </button>
              <button className="px-8 py-3 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition text-xl" onClick={() => setIsMenuOpen(false)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
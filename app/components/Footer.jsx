'use client';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Section - Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* About Column */}
            <div>
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <ul className="space-y-2">
                <li><Link href="/about-us" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact-us" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Features Column */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Chat Guide</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Destinations</a></li>
              </ul>
            </div>

            {/* FAQ Column */}
            <div>
              <h3 className="text-xl font-semibold mb-4">FAQ</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* Right Section - Newsletter */}
          <div className="flex flex-col items-start lg:items-end">
            <div className="max-w-md w-full">
              <h3 className="text-xl font-semibold mb-2">Newsletter</h3>
              <p className="text-gray-400 mb-6">
                Join our travel community and receive exclusive deals, insider tips, and inspiring destinations straight to your inbox. Let's make your dream journey a reality!
              </p>
              
              {/* Email Input */}
              <div className="w-full">
                <div className="flex">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiMail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-3 bg-white/10 rounded-l-full text-white placeholder-gray-400 outline-none border border-gray-800 focus:border-gray-600"
                    />
                  </div>
                  <button className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-r-full hover:bg-gray-700 transition-colors">
                    Submit
                  </button>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-6 mt-8 justify-end w-full">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaInstagram size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook size={24} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaYoutube size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>©2025 TripSage, All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
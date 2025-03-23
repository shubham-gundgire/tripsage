'use client';
import { FaShieldAlt, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Header with breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <FaChevronRight className="mx-2 text-xs text-gray-400" />
          <span className="text-gray-700">Privacy Policy</span>
        </div>
        
        <div className="flex items-center justify-center mb-10">
          <div className="bg-indigo-100 p-3 rounded-full mr-5">
            <FaShieldAlt className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Date banner */}
          <div className="bg-indigo-600 text-white py-4 px-8 flex justify-between items-center">
            <p className="font-medium">Last Updated: August 15, 2023</p>
            <Link href="/" className="text-white hover:text-indigo-100 text-sm flex items-center transition-colors">
              <span>Back to Home</span>
              <FaChevronRight className="ml-1 text-xs" />
            </Link>
          </div>
          
          <div className="p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3">Introduction</h2>
              <p>
                Welcome to TripSage. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you about how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our website, including:
              </p>
              <ul className="space-y-3">
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">Personal Identifiers:</strong> Such as name, email address, and contact details when you 
                  create an account or sign up for our newsletter.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">Trip Information:</strong> Details about your travel plans, including destinations, dates, 
                  accommodation preferences, and activities of interest.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">Technical Data:</strong> Information about your browsing actions and patterns, including IP 
                  address, browser type and version, time zone setting, operating system, and platform.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">Usage Data:</strong> Information about how you use our website, products, and services.
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Providing personalized travel recommendations and itineraries</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Improving our website and user experience</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Sending you newsletters and marketing communications (if you've opted in)</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Analyzing usage patterns to enhance our services</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Responding to your inquiries and customer service requests</span>
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information to third parties. We may share your information with:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Service providers who perform services on our behalf</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Business partners with whom we jointly offer products or services</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Law enforcement or other authorities if required by law</span>
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal data, including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to access your personal data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to correct inaccurate data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to delete your data (under certain circumstances)</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to restrict processing of your data</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to data portability</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-700">Right to object to processing of your data</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Data Security</h2>
              <p>
                We have implemented appropriate security measures to prevent your personal data from being 
                accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We limit 
                access to your personal data to those employees, agents, contractors, and other third parties 
                who have a business need to know.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and store 
                certain information. You can instruct your browser to refuse all cookies or to indicate when 
                a cookie is being sent.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">International Transfers</h2>
              <p>
                Your data may be transferred to and processed in countries outside of your country of residence. 
                We ensure your data is protected by requiring all our group companies to follow the same rules 
                when processing your personal data.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Changes to This Privacy Policy</h2>
              <p>
                We may update our privacy policy from time to time. We will notify you of any changes by posting 
                the new privacy policy on this page and updating the "Last Updated" date.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-indigo-50 p-5 rounded-lg mt-4 flex flex-col md:flex-row justify-between">
                <div>
                  <p className="font-medium text-indigo-800 mb-1">Email:</p>
                  <a href="mailto:privacy@tripsage.com" className="text-indigo-600 hover:underline">privacy@tripsage.com</a>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="font-medium text-indigo-800 mb-1">Address:</p>
                  <p>123 Travel Street, Digital City, 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md">
            <span>Return to Homepage</span>
            <FaChevronRight className="ml-2 text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
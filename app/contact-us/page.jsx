'use client';
import { FaEnvelope, FaChevronRight, FaMapMarkerAlt, FaPhone, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Header with breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <FaChevronRight className="mx-2 text-xs text-gray-400" />
          <span className="text-gray-700">Contact Us</span>
        </div>
        
        <div className="flex items-center justify-center mb-14">
          <div className="bg-indigo-100 p-3 rounded-full mr-5">
            <FaEnvelope className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Contact Form */}
            <div className="md:w-7/12 p-8 md:p-10">
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3">Get in Touch</h2>
              <p className="mt-6 text-gray-700 mb-8">
                Have questions about our services or need assistance with your travel plans? 
                Fill out the form below and our team will get back to you as soon as possible.
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your email address"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select 
                    id="subject" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Travel Support</option>
                    <option value="partnership">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    id="message" 
                    rows="5" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="privacy" 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                    I agree to the <Link href="/privacy-policy" className="text-indigo-600 hover:text-indigo-700">Privacy Policy</Link>
                  </label>
                </div>
                
                <button 
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Send Message
                  <FaChevronRight className="ml-2 text-xs" />
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div className="md:w-5/12 bg-indigo-600 text-white p-8 md:p-10">
              <h2 className="text-2xl font-semibold border-b border-indigo-500 border-opacity-50 pb-3">Contact Information</h2>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="bg-indigo-500 bg-opacity-50 rounded-full p-3 mr-4">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Our Location</h3>
                    <p className="text-indigo-200">
                      TripSage Headquarters<br />
                      123 Travel Street<br />
                      Digital City, 10001
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-500 bg-opacity-50 rounded-full p-3 mr-4">
                    <FaPhone className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-indigo-200">
                      +1 (555) 123-4567<br />
                      +1 (555) 987-6543
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-500 bg-opacity-50 rounded-full p-3 mr-4">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-indigo-200">
                      <a href="mailto:info@tripsage.com" className="hover:text-white transition-colors">info@tripsage.com</a><br />
                      <a href="mailto:support@tripsage.com" className="hover:text-white transition-colors">support@tripsage.com</a>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-500 bg-opacity-50 rounded-full p-3 mr-4">
                    <FaClock className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Working Hours</h3>
                    <p className="text-indigo-200">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 4:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div className="mt-10">
                <h3 className="font-medium mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="bg-indigo-500 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors">
                    <FaFacebook />
                  </a>
                  <a href="#" className="bg-indigo-500 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors">
                    <FaTwitter />
                  </a>
                  <a href="#" className="bg-indigo-500 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors">
                    <FaInstagram />
                  </a>
                  <a href="#" className="bg-indigo-500 bg-opacity-50 w-10 h-10 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-colors">
                    <FaLinkedin />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-bold text-center text-indigo-800 mb-10">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How quickly can I expect a response?</h3>
            <p className="text-gray-600">
              We aim to respond to all inquiries within 24-48 hours during business days. For urgent 
              matters, please call our customer support line.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Do you offer customer support for existing bookings?</h3>
            <p className="text-gray-600">
              Yes, our support team is available to assist with any questions or changes to your 
              travel plans. Please provide your booking reference when contacting us.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I partner with TripSage for my business?</h3>
            <p className="text-gray-600">
              We're always open to exploring partnerships with businesses that align with our values. 
              Please select "Business Partnership" in the subject dropdown when contacting us.
            </p>
          </div>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="max-w-6xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30596698663!2d-74.25986548678186!3d40.69714941680757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1629789507736!5m2!1sen!2sin" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              className="rounded-lg"
            ></iframe>
          </div>
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
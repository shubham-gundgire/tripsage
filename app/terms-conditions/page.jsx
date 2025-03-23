'use client';
import { FaGavel, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Header with breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
          <FaChevronRight className="mx-2 text-xs text-gray-400" />
          <span className="text-gray-700">Terms & Conditions</span>
        </div>
        
        <div className="flex items-center justify-center mb-10">
          <div className="bg-indigo-100 p-3 rounded-full mr-5">
            <FaGavel className="text-3xl text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
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
                Welcome to TripSage! These Terms and Conditions govern your use of the TripSage website and services. 
                By accessing or using our platform, you agree to be bound by these Terms. Please read them carefully.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Definitions</h2>
              <p>
                In these Terms and Conditions:
              </p>
              <ul className="space-y-3">
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">"TripSage," "we," "us," and "our"</strong> refer to TripSage Inc.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">"User," "you," and "your"</strong> refer to the person accessing or using our services.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">"Services"</strong> refers to all features, applications, content, and products we provide.
                </li>
                <li className="bg-gray-50 p-3 rounded-lg">
                  <strong className="text-indigo-700">"Content"</strong> includes text, images, videos, audio, graphics, and other materials.
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Account Registration</h2>
              <p>
                To access certain features of our platform, you may need to create an account. When registering, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
              
              <div className="bg-indigo-50 p-5 rounded-lg my-6 border-l-4 border-indigo-500">
                <p className="text-indigo-800 font-medium">
                  You are responsible for all activities that occur under your account, whether or not you authorized them.
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Services Description</h2>
              <p>
                TripSage provides travel planning services, including personalized itineraries, destination information, accommodation recommendations, and other travel-related content. While we strive to provide accurate and up-to-date information, we cannot guarantee the completeness, reliability, or accuracy of all content.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">User Conduct</h2>
              <p>
                When using our services, you agree not to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Violate any applicable laws or regulations</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Infringe on the rights of others, including intellectual property rights</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Distribute malware or engage in any activity that could harm our systems</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Attempt to gain unauthorized access to our platform or user accounts</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Use our services for any illegal or unauthorized purpose</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-indigo-100 rounded-full p-1 mr-3 mt-1.5">
                    <FaChevronRight className="text-xs text-indigo-600" />
                  </div>
                  <span>Post false, misleading, or deceptive content</span>
                </li>
              </ul>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Intellectual Property</h2>
              <p>
                All content, features, and functionality on TripSage, including but not limited to text, graphics, logos, icons, and software, are owned by TripSage or our licensors and are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without explicit permission.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Third-Party Services</h2>
              <p>
                Our platform may contain links to third-party websites or services that are not owned or controlled by TripSage. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party websites or services. You acknowledge that TripSage shall not be responsible or liable for any damage or loss caused by your use of such third-party services.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Disclaimers</h2>
              <div className="bg-amber-50 p-5 rounded-lg border-l-4 border-amber-500 my-4">
                <p className="text-amber-800">
                  TripSage services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, secure, or error-free. Travel information, including pricing, availability, and conditions, may change without notice.
                </p>
              </div>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, TripSage shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services, including but not limited to loss of profits, data, or goodwill.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless TripSage and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from your use of our services or violation of these Terms.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Updated Terms will be posted on this page with a revised "Last Updated" date. Your continued use of our services after such changes constitutes your acceptance of the new Terms.
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the courts of [Jurisdiction].
              </p>
              
              <h2 className="text-2xl font-semibold text-indigo-800 border-b border-gray-100 pb-3 mt-10">Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-indigo-50 p-5 rounded-lg mt-4 flex flex-col md:flex-row justify-between">
                <div>
                  <p className="font-medium text-indigo-800 mb-1">Email:</p>
                  <a href="mailto:legal@tripsage.com" className="text-indigo-600 hover:underline">legal@tripsage.com</a>
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
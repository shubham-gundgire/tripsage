'use client';

import Link from 'next/link';
import { 
  BiWallet, 
  BiPieChartAlt2, 
  BiTransfer, 
  BiMobile,
  BiCheckCircle
} from 'react-icons/bi';

const BudgetTrackerPromo = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
              <span className="block xl:inline">Travel smarter with our</span>{' '}
              <span className="block text-indigo-600 xl:inline">Budget Tracker</span>
            </h2>
            <p className="mt-3 text-lg text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
              Plan, manage, and track your travel expenses all in one place. Stay on budget and make the most of your 
              travel experience with our easy-to-use budget management tool.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <BiCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-500">
                  <span className="font-medium text-gray-900">Create personalized budgets</span> for 
                  accommodation, transportation, food, activities, and more.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <BiCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-500">
                  <span className="font-medium text-gray-900">Track all your expenses</span> in 
                  one place with our intuitive expense management system.
                </p>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <BiCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-500">
                  <span className="font-medium text-gray-900">Convert between currencies</span> with 
                  our built-in currency converter for accurate budget planning.
                </p>
              </div>
            </div>

            <div className="mt-10">
              <Link 
                href="/budget-tracker" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Planning Your Budget
              </Link>
            </div>
          </div>

          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-white mb-2">Trip Budget Overview</h3>
                  <div className="w-full bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-white">Overall Budget</span>
                      <span className="text-sm font-medium text-white">$2,500.00</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-white mt-1">$875.00 remaining</p>
                  </div>

                  <div className="w-full space-y-2">
                    <div className="flex items-center">
                      <BiWallet className="text-white mr-2" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-white">Accommodation</span>
                          <span className="text-xs text-white">$800 / $900</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                          <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <BiPieChartAlt2 className="text-white mr-2" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-white">Food & Drinks</span>
                          <span className="text-xs text-white">$425 / $500</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <BiMobile className="text-white mr-2" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-white">Transportation</span>
                          <span className="text-xs text-white">$250 / $400</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                          <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '63%' }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <BiTransfer className="text-white mr-2" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs font-medium text-white">Activities</span>
                          <span className="text-xs text-white">$150 / $300</span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                          <div className="bg-green-400 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetTrackerPromo; 
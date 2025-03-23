'use client';

import { useState, useEffect } from 'react';
import { 
  BiSave, 
  BiTrash, 
  BiPlus, 
  BiEdit,
  BiDollar,
  BiSync,
  BiListUl,
  BiCheck
} from 'react-icons/bi';
import { budgetCategories, currencyOptions, exchangeRates } from '../data/budget-categories';
import BudgetSummary from './components/BudgetSummary';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import CurrencyConverter from './components/CurrencyConverter';
import TripDataManager from './components/TripDataManager';
import { loadTrips, saveTrips, setLastActiveTripId } from './utils/storageUtils';
import TripSelector from './components/TripSelector';

export default function BudgetTracker() {
  // Trips state
  const [trips, setTrips] = useState([]);
  const [currentTripId, setCurrentTripId] = useState(null);
  const [newTripName, setNewTripName] = useState('');
  const [showNewTripForm, setShowNewTripForm] = useState(false);

  // Current trip data
  const [tripName, setTripName] = useState('My Trip');
  const [isEditingName, setIsEditingName] = useState(false);
  const [totalBudget, setTotalBudget] = useState(1000);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [categoryBudgets, setCategoryBudgets] = useState({});

  // Load trips from localStorage on initial load
  useEffect(() => {
    loadTripsFromStorage();
  }, []);

  const loadTripsFromStorage = () => {
    const parsedTrips = loadTrips();
    setTrips(parsedTrips);
    
    // If we have saved trips, select the first one or the last active one
    if (parsedTrips.length > 0) {
      const lastActiveTrip = localStorage.getItem('lastActiveTripId');
      if (lastActiveTrip && parsedTrips.find(trip => trip.id === lastActiveTrip)) {
        setCurrentTripId(lastActiveTrip);
      } else {
        setCurrentTripId(parsedTrips[0].id);
      }
    } else {
      // If no trips exist, create a default one
      createNewTrip('My First Trip');
    }
  };

  // Load current trip data whenever the current trip ID changes
  useEffect(() => {
    if (!currentTripId || trips.length === 0) return;
    
    const currentTrip = trips.find(trip => trip.id === currentTripId);
    if (currentTrip) {
      setTripName(currentTrip.name);
      setTotalBudget(currentTrip.totalBudget);
      setBaseCurrency(currentTrip.baseCurrency);
      setExpenses(currentTrip.expenses || []);
      setCategoryBudgets(currentTrip.categoryBudgets || initializeDefaultBudgets(currentTrip.totalBudget));
      
      // Save the last active trip ID
      setLastActiveTripId(currentTripId);
    }
  }, [currentTripId, trips]);

  // Initialize default budgets based on percentages
  const initializeDefaultBudgets = (budget) => {
    const initialBudgets = {};
    budgetCategories.forEach(category => {
      initialBudgets[category.id] = (budget * category.defaultBudget) / 100;
    });
    return initialBudgets;
  };

  // Save current trip data whenever it changes
  useEffect(() => {
    if (!currentTripId) return;
    
    const updatedTrips = trips.map(trip => 
      trip.id === currentTripId ? {
        ...trip,
        name: tripName,
        totalBudget,
        baseCurrency,
        expenses,
        categoryBudgets,
        lastUpdated: new Date().toISOString()
      } : trip
    );
    
    setTrips(updatedTrips);
    saveTrips(updatedTrips);
  }, [tripName, totalBudget, baseCurrency, expenses, categoryBudgets]);

  // Create a new trip
  const createNewTrip = (name) => {
    const newTrip = {
      id: Date.now().toString(),
      name: name,
      totalBudget: 1000,
      baseCurrency: 'USD',
      expenses: [],
      categoryBudgets: initializeDefaultBudgets(1000),
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    setCurrentTripId(newTrip.id);
    saveTrips(updatedTrips);
    setShowNewTripForm(false);
    setNewTripName('');
  };

  // Delete the current trip
  const deleteCurrentTrip = () => {
    if (trips.length <= 1) {
      alert("You can't delete your only trip. Create a new one first.");
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${tripName}"? This cannot be undone.`)) {
      const updatedTrips = trips.filter(trip => trip.id !== currentTripId);
      setTrips(updatedTrips);
      saveTrips(updatedTrips);
      setCurrentTripId(updatedTrips[0].id);
    }
  };

  // Handle successful data import
  const handleImportComplete = () => {
    loadTripsFromStorage();
  };

  // Handle expense functions
  const handleAddExpense = (newExpense) => {
    if (editingExpense) {
      // Update existing expense
      setExpenses(expenses.map(expense => 
        expense.id === editingExpense.id ? { ...newExpense, id: expense.id } : expense
      ));
      setEditingExpense(null);
    } else {
      // Add new expense
      setExpenses([...expenses, { ...newExpense, id: Date.now().toString() }]);
    }
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCategoryBudgetChange = (categoryId, value) => {
    setCategoryBudgets({
      ...categoryBudgets,
      [categoryId]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header with proper spacing for fixed navbar */}
      <div className="pt-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-1/4 top-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
            <div className="absolute right-1/4 bottom-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float delay-1000"></div>
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          </div>
          <div className="text-center relative z-10">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl drop-shadow-md">
              Budget Tracker
            </h1>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Plan, track, and manage your travel expenses all in one place
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
                <span className="text-xs font-semibold uppercase tracking-wider">Organized • Simple • Effective</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gray-50 opacity-50" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Trip Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 sm:mb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0 flex items-center">
              <TripSelector
                trips={trips}
                currentTripId={currentTripId}
                onSelectTrip={(tripId) => setCurrentTripId(tripId)}
                onCreateNewTrip={() => setShowNewTripForm(true)}
              />
              
              <div className="ml-4">
                {isEditingName ? (
                  <div className="flex items-center">
                    <input 
                      type="text"
                      value={tripName}
                      onChange={(e) => setTripName(e.target.value)}
                      className="border-b border-gray-300 px-2 py-1 text-xl font-bold focus:outline-none focus:border-indigo-500"
                      autoFocus
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    />
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <BiSave size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h2 className="text-xl font-bold text-gray-800">{tripName}</h2>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="ml-2 text-gray-500 hover:text-indigo-600"
                    >
                      <BiEdit size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center">
                <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 mr-2">
                  Total Budget:
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">
                      {currencyOptions.find(c => c.code === baseCurrency)?.symbol || '$'}
                    </span>
                  </div>
                  <input
                    type="number"
                    name="total-budget"
                    id="total-budget"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mr-2">
                  Currency:
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                >
                  {currencyOptions.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol}) - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {/* Budget Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 z-10">
              <BudgetSummary 
                expenses={expenses}
                totalBudget={totalBudget}
                categoryBudgets={categoryBudgets}
                onCategoryBudgetChange={handleCategoryBudgetChange}
                baseCurrency={baseCurrency}
              />

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(true)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <BiPlus className="mr-2" size={20} />
                  Add New Expense
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  onClick={deleteCurrentTrip}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <BiTrash className="mr-2" size={20} />
                  Delete Trip
                </button>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Import or export your trip data:</p>
                  <TripDataManager 
                    tripId={currentTripId} 
                    onImportComplete={handleImportComplete} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Expense List and Currency Converter */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <ExpenseList 
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                baseCurrency={baseCurrency}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <CurrencyConverter baseCurrency={baseCurrency} />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <ExpenseForm 
              onSubmit={handleAddExpense}
              onCancel={() => {
                setShowExpenseForm(false);
                setEditingExpense(null);
              }}
              expense={editingExpense}
              baseCurrency={baseCurrency}
            />
          </div>
        </div>
      )}

      {/* New Trip Modal */}
      {showNewTripForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-[1000]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Trip</h3>
            <div>
              <label htmlFor="new-trip-name" className="block text-sm font-medium text-gray-700 mb-2">
                Trip Name
              </label>
              <input
                type="text"
                id="new-trip-name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                placeholder="Enter a name for your trip"
                autoFocus
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewTripForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createNewTrip(newTripName || 'New Trip')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={!newTripName.trim()}
                >
                  Create Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
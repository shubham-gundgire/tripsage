'use client';

import { useState, useEffect } from 'react';
import { budgetCategories, currencyOptions } from '../../data/budget-categories';

const ExpenseForm = ({ onSubmit, onCancel, expense, baseCurrency }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: budgetCategories[0].id,
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount || '',
        category: expense.category || budgetCategories[0].id,
        date: new Date(expense.date).toISOString().split('T')[0],
        location: expense.location || '',
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }
    
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onSubmit({
      ...formData,
      date: new Date(formData.date).getTime()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <input
          type="text"
          name="description"
          id="description"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="E.g., Hotel stay, Dinner, Museum tickets"
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {currencyOptions.find(c => c.code === baseCurrency)?.symbol || '$'}
              </span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              required
              min="0"
              step="0.01"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">
                {baseCurrency}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={formData.category}
            onChange={handleChange}
          >
            {budgetCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date *
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            name="location"
            id="location"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="E.g., Paris, Restaurant name, Hotel name"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Any additional information"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {expense ? 'Update' : 'Add'} Expense
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm; 
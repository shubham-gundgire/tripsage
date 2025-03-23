'use client';

import { useState } from 'react';
import { BiEdit, BiTrash, BiSortAlt2, BiFilterAlt } from 'react-icons/bi';
import { budgetCategories, currencyOptions } from '../../data/budget-categories';

const ExpenseList = ({ expenses, onEdit, onDelete, baseCurrency }) => {
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');

  const formatCurrency = (amount) => {
    const currencySymbol = currencyOptions.find(c => c.code === baseCurrency)?.symbol || '$';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getCategoryName = (categoryId) => {
    const category = budgetCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getCategoryColor = (categoryId) => {
    const category = budgetCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredExpenses = expenses
    .filter(expense => filterCategory === 'all' || expense.category === filterCategory)
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.date - b.date;
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          const catA = getCategoryName(a.category);
          const catB = getCategoryName(b.category);
          comparison = catA.localeCompare(catB);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Expenses</h3>
        
        <div className="flex space-x-2">
          <div className="relative">
            <select
              id="filter"
              name="filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              {budgetCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <BiFilterAlt className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {sortedAndFilteredExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'date' && (
                      <BiSortAlt2 className={`ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('description')}
                >
                  <div className="flex items-center">
                    Description
                    {sortBy === 'description' && (
                      <BiSortAlt2 className={`ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'category' && (
                      <BiSortAlt2 className={`ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    Amount
                    {sortBy === 'amount' && (
                      <BiSortAlt2 className={`ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.description}
                    {expense.location && (
                      <span className="text-xs text-gray-500 block">{expense.location}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getCategoryColor(expense.category)}-100 text-${getCategoryColor(expense.category)}-800`}>
                      {getCategoryName(expense.category)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => onEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <BiEdit size={18} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <BiTrash size={18} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No expenses yet. Add your first expense to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseList; 
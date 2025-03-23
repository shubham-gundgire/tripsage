'use client';

import { useState } from 'react';
import { 
  BiEdit, 
  BiSave, 
  BiInfoCircle,
  BiBuildingHouse,
  BiTrain,
  BiRestaurant,
  BiCamera,
  BiShoppingBag,
  BiDotsHorizontalRounded,
} from 'react-icons/bi';
import { budgetCategories, currencyOptions } from '../../data/budget-categories';

const BudgetSummary = ({ 
  expenses, 
  totalBudget, 
  categoryBudgets, 
  onCategoryBudgetChange,
  baseCurrency 
}) => {
  const [editingCategory, setEditingCategory] = useState(null);

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'BiBuildingHouse': return <BiBuildingHouse />;
      case 'BiTrain': return <BiTrain />;
      case 'BiRestaurant': return <BiRestaurant />;
      case 'BiCamera': return <BiCamera />;
      case 'BiShoppingBag': return <BiShoppingBag />;
      case 'BiDotsHorizontalRounded': return <BiDotsHorizontalRounded />;
      default: return <BiInfoCircle />;
    }
  };

  const getCategoryExpenses = (categoryId) => {
    return expenses
      .filter(expense => expense.category === categoryId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getRemainingBudget = () => {
    return totalBudget - getTotalExpenses();
  };

  const formatCurrency = (amount) => {
    const currencySymbol = currencyOptions.find(c => c.code === baseCurrency)?.symbol || '$';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const getProgressBarColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Summary</h3>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {formatCurrency(getTotalExpenses())} / {formatCurrency(totalBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${getProgressBarColor(getTotalExpenses(), totalBudget)}`} 
            style={{ width: `${Math.min(100, (getTotalExpenses() / totalBudget) * 100)}%` }}
          ></div>
        </div>
        <p className={`text-sm mt-2 ${getRemainingBudget() >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
          {getRemainingBudget() >= 0 
            ? `${formatCurrency(getRemainingBudget())} remaining` 
            : `${formatCurrency(Math.abs(getRemainingBudget()))} over budget`}
        </p>
      </div>

      <h4 className="text-sm font-medium text-gray-700 mb-2">Category Breakdown</h4>
      <div className="space-y-4">
        {budgetCategories.map((category) => {
          const categoryExpense = getCategoryExpenses(category.id);
          const categoryBudget = categoryBudgets[category.id] || 0;
          
          return (
            <div key={category.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className={`text-${category.color}-500 mr-2`}>
                    {getIconComponent(category.icon)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                
                {editingCategory === category.id ? (
                  <div className="flex items-center">
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">
                          {currencyOptions.find(c => c.code === baseCurrency)?.symbol || '$'}
                        </span>
                      </div>
                      <input
                        type="number"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-8 sm:text-sm border-gray-300 rounded-md"
                        value={categoryBudget}
                        onChange={(e) => onCategoryBudgetChange(category.id, Number(e.target.value))}
                      />
                    </div>
                    <button 
                      onClick={() => setEditingCategory(null)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <BiSave size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">
                      {formatCurrency(categoryExpense)} / {formatCurrency(categoryBudget)}
                    </span>
                    <button 
                      onClick={() => setEditingCategory(category.id)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <BiEdit size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getProgressBarColor(categoryExpense, categoryBudget)}`} 
                  style={{ width: `${Math.min(100, (categoryExpense / (categoryBudget || 1)) * 100)}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetSummary; 
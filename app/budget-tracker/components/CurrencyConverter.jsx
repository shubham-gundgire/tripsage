'use client';

import { useState, useEffect } from 'react';
import { BiTransfer } from 'react-icons/bi';
import { currencyOptions, exchangeRates } from '../../data/budget-categories';

const CurrencyConverter = ({ baseCurrency }) => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState(baseCurrency);
  const [toCurrency, setToCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    // Set default currencies when baseCurrency changes
    setFromCurrency(baseCurrency);
    if (baseCurrency === 'EUR') {
      setToCurrency('USD');
    }
  }, [baseCurrency]);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      // Convert to USD first (our base rate)
      const amountInUSD = amount / exchangeRates[fromCurrency];
      // Then convert from USD to target currency
      const result = amountInUSD * exchangeRates[toCurrency];
      setConvertedAmount(result);
      
      // Calculate the exchange rate
      const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
      setExchangeRate(rate);
    } else {
      setConvertedAmount(null);
      setExchangeRate(null);
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value, currency) => {
    if (value === null) return '';
    const currencySymbol = currencyOptions.find(c => c.code === currency)?.symbol || '$';
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Converter</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">
                  {currencyOptions.find(c => c.code === fromCurrency)?.symbol || '$'}
                </span>
              </div>
              <input
                type="number"
                id="amount"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{fromCurrency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <div className="flex-grow">
              <label htmlFor="from-currency" className="block text-sm font-medium text-gray-700">
                From
              </label>
              <select
                id="from-currency"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="button" 
              className="p-2 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSwapCurrencies}
            >
              <BiTransfer size={20} className="text-gray-500" />
              <span className="sr-only">Swap currencies</span>
            </button>
            <div className="flex-grow">
              <label htmlFor="to-currency" className="block text-sm font-medium text-gray-700">
                To
              </label>
              <select
                id="to-currency"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {convertedAmount !== null && (
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {amount} {fromCurrency} =
              </p>
              <p className="text-2xl font-bold text-gray-900 my-2">
                {formatCurrency(convertedAmount, toCurrency)} {toCurrency}
              </p>
              <p className="text-xs text-gray-500">
                1 {fromCurrency} = {exchangeRate?.toFixed(4)} {toCurrency}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Exchange rates are for informational purposes only
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter; 
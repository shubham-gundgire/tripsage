export const budgetCategories = [
  {
    id: 'accommodation',
    name: 'Accommodation',
    icon: 'BiBuildingHouse',
    description: 'Hotels, hostels, Airbnb, and other lodging expenses',
    color: 'indigo',
    defaultBudget: 30 // percent of total budget
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'BiTrain',
    description: 'Flights, trains, buses, taxis, and car rentals',
    color: 'blue',
    defaultBudget: 25
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: 'BiRestaurant',
    description: 'Restaurants, cafes, groceries, and street food',
    color: 'green',
    defaultBudget: 20
  },
  {
    id: 'activities',
    name: 'Activities',
    icon: 'BiCamera',
    description: 'Tours, attractions, museums, and entertainment',
    color: 'amber',
    defaultBudget: 15
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'BiShoppingBag',
    description: 'Souvenirs, clothing, and other retail purchases',
    color: 'pink',
    defaultBudget: 5
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'BiDotsHorizontalRounded',
    description: 'Travel insurance, visas, tips, and miscellaneous expenses',
    color: 'gray',
    defaultBudget: 5
  }
];

export const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' }
];

export const exchangeRates = {
  USD: 1,
  EUR: 0.93,
  GBP: 0.79,
  INR: 83.34,
  JPY: 151.23,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.35,
  THB: 36.91,
  MYR: 4.72
}; 
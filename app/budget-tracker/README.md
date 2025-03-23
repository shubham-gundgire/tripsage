# TripSage Budget Tracker

A comprehensive travel budget management tool for planning and tracking expenses across multiple trips.

## Features

- **Multiple Trip Management**: Create and manage separate budgets for different trips
- **Trip Budget Planning**: Set an overall budget and customize allocations for different expense categories
- **Expense Tracking**: Add, edit, and delete expenses with detailed information (description, amount, category, date, location)
- **Budget Categories**: Pre-defined categories (accommodation, food, transportation, activities, etc.) with customizable budget allocations
- **Currency Conversion**: Built-in currency converter with support for major world currencies
- **Data Visualization**: Visual representations of budget allocation and spending breakdown
- **Persistent Storage**: All trip data saved in browser's localStorage, ensuring your budget information is preserved
- **Data Import/Export**: Export your trip data as JSON and import it later, or transfer it between devices

## Technical Implementation

### Technology Stack
- **Frontend Framework**: React with Next.js
- **State Management**: Client-side state with React hooks
- **Styling**: Responsive design with Tailwind CSS
- **Data Persistence**: localStorage with JSON serialization for trip data
- **Icons**: React-icons for visual elements

### Components
- **BudgetTracker**: Main component orchestrating the budget tracking experience
- **BudgetSummary**: Displays budget overview, remaining funds, and category breakdown
- **ExpenseList**: Tabular view of all expenses with filtering and sorting options
- **ExpenseForm**: Form for adding or editing expense entries
- **CurrencyConverter**: Utility for converting between different currencies
- **TripDataManager**: Handles importing and exporting trip data as JSON

### Data Storage
The Budget Tracker uses the browser's localStorage to save all budget data. Each trip has its own data structure containing:
- Trip metadata (name, created date, last updated)
- Budget settings (total amount, currency)
- Category allocations
- Expense entries
- Currency preferences

All data is automatically saved as you make changes and will persist across browser sessions.

## Future Enhancements

- **Cloud Synchronization**: Sync data across devices via cloud storage
- **Offline Support**: Full functionality even without an internet connection
- **Data Export Options**: Export to CSV or PDF for reporting
- **Trip Templates**: Create templates for recurring trip types
- **Receipt Scanning**: Add expenses by taking photos of receipts
- **Social Sharing**: Share trip budgets with travel companions
- **Budget Recommendations**: AI-powered suggestions based on destination 
/**
 * Utility functions for managing trip data in local storage
 */

// Storage keys
const TRIPS_STORAGE_KEY = 'tripSageTrips';
const LAST_ACTIVE_TRIP_KEY = 'lastActiveTripId';

/**
 * Load all trips from local storage
 * @returns {Array} Array of trip objects or empty array if none found
 */
export const loadTrips = () => {
  try {
    const tripsData = localStorage.getItem(TRIPS_STORAGE_KEY);
    return tripsData ? JSON.parse(tripsData) : [];
  } catch (error) {
    console.error('Error loading trips from localStorage:', error);
    return [];
  }
};

/**
 * Save trips to local storage
 * @param {Array} trips Array of trip objects
 */
export const saveTrips = (trips) => {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Error saving trips to localStorage:', error);
  }
};

/**
 * Get a single trip by ID
 * @param {string} tripId The ID of the trip to get
 * @returns {Object|null} Trip object or null if not found
 */
export const getTripById = (tripId) => {
  const trips = loadTrips();
  return trips.find(trip => trip.id === tripId) || null;
};

/**
 * Save a single trip (updates if exists, adds if new)
 * @param {Object} trip Trip object to save
 */
export const saveTrip = (trip) => {
  const trips = loadTrips();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  
  if (existingIndex >= 0) {
    // Update existing trip
    trips[existingIndex] = {
      ...trips[existingIndex],
      ...trip,
      lastUpdated: new Date().toISOString()
    };
  } else {
    // Add new trip
    trips.push({
      ...trip,
      id: trip.id || Date.now().toString(),
      created: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  }
  
  saveTrips(trips);
};

/**
 * Delete a trip by ID
 * @param {string} tripId The ID of the trip to delete
 * @returns {boolean} Success status
 */
export const deleteTrip = (tripId) => {
  try {
    const trips = loadTrips();
    const updatedTrips = trips.filter(trip => trip.id !== tripId);
    
    if (updatedTrips.length === trips.length) {
      return false; // Trip wasn't found
    }
    
    saveTrips(updatedTrips);
    
    // If the deleted trip was the last active trip, update the last active trip
    const lastActiveTripId = getLastActiveTripId();
    if (lastActiveTripId === tripId && updatedTrips.length > 0) {
      setLastActiveTripId(updatedTrips[0].id);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    return false;
  }
};

/**
 * Get the ID of the last active trip
 * @returns {string|null} Trip ID or null if none found
 */
export const getLastActiveTripId = () => {
  return localStorage.getItem(LAST_ACTIVE_TRIP_KEY);
};

/**
 * Set the ID of the last active trip
 * @param {string} tripId Trip ID to set as last active
 */
export const setLastActiveTripId = (tripId) => {
  localStorage.setItem(LAST_ACTIVE_TRIP_KEY, tripId);
};

/**
 * Export trip data as JSON
 * @param {string} tripId ID of the trip to export (or null for all trips)
 * @returns {string} JSON string of the trip data
 */
export const exportTripData = (tripId = null) => {
  try {
    if (tripId) {
      const trip = getTripById(tripId);
      return trip ? JSON.stringify(trip, null, 2) : null;
    } else {
      const trips = loadTrips();
      return JSON.stringify(trips, null, 2);
    }
  } catch (error) {
    console.error('Error exporting trip data:', error);
    return null;
  }
};

/**
 * Import trip data from JSON
 * @param {string} jsonData JSON string of trip data to import
 * @returns {boolean} Success status
 */
export const importTripData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (Array.isArray(data)) {
      // Multiple trips
      saveTrips(data);
    } else if (data && typeof data === 'object') {
      // Single trip
      saveTrip(data);
    } else {
      throw new Error('Invalid trip data format');
    }
    
    return true;
  } catch (error) {
    console.error('Error importing trip data:', error);
    return false;
  }
}; 
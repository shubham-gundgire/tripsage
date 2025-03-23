'use client';

import { useState } from 'react';
import { BiExport, BiImport, BiDownload, BiUpload, BiX } from 'react-icons/bi';
import { exportTripData, importTripData } from '../utils/storageUtils';

export default function TripDataManager({ tripId, onImportComplete }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');

  // Handle export button click
  const handleExport = () => {
    const data = exportTripData(tripId);
    setExportData(data);
    setShowExportModal(true);
  };

  // Handle import from text input
  const handleImport = () => {
    setImportError('');
    
    try {
      if (!importData.trim()) {
        setImportError('Please enter valid JSON data');
        return;
      }
      
      const success = importTripData(importData);
      
      if (success) {
        setShowImportModal(false);
        setImportData('');
        
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        setImportError('Failed to import data. Please check the format and try again.');
      }
    } catch (error) {
      setImportError('Invalid JSON format. Please check the data and try again.');
    }
  };

  // Handle import from file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target.result);
    };
    reader.onerror = () => {
      setImportError('Error reading file');
    };
    reader.readAsText(file);
  };

  // Download export data as a file
  const downloadExportData = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tripId 
      ? `tripsage-trip-${tripId.slice(0, 8)}.json`
      : 'tripsage-trips.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <BiExport className="mr-1" />
          Export
        </button>
        <button
          type="button"
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <BiImport className="mr-1" />
          Import
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Export Trip Data</h3>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <BiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Copy the data below or download it as a file. You can use this data to import your trips later.
              </p>
              <textarea
                className="w-full h-60 p-2 border border-gray-300 rounded-md shadow-inner text-xs font-mono"
                value={exportData}
                readOnly
                onClick={(e) => e.target.select()}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={downloadExportData}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <BiDownload className="inline mr-1" />
                Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import Trip Data</h3>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <BiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Paste the JSON data exported from TripSage, or upload a JSON file.
              </p>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload JSON file
                </label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or paste JSON data
              </label>
              <textarea
                className="w-full h-40 p-2 border border-gray-300 rounded-md shadow-inner text-xs font-mono"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste JSON data here..."
              />
              
              {importError && (
                <p className="mt-2 text-sm text-red-600">{importError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <BiUpload className="inline mr-1" />
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
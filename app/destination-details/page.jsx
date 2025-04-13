'use client';
import React, { Suspense } from 'react';
import DestinationDetailsContent from './DestinationDetailsContent';

// Export a dynamic page configuration to disable static prerendering
export const dynamic = 'force-dynamic';

export default function DestinationDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <DestinationDetailsContent />
    </Suspense>
  );
} 
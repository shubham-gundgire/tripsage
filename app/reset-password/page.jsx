'use client';

import React, { Suspense } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

// Separate component that uses useSearchParams
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-pulse flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gray-300"></div>
          </div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
          <div className="h-10 bg-gray-300 rounded w-full mx-auto mt-4"></div>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
} 
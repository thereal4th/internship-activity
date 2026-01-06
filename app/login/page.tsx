'use client';

import { useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authenticate } from '@/app/actions/authactions';
import { Button } from '@/components/Button';
import { CalendarCheck, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  // 1. Hook into our Server Action
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);
  
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get('registered') === 'true';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center bg-black p-3 rounded-2xl mb-4">
            <CalendarCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your details to access your bookings.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          
          {/* Success message from Signup redirect */}
          {showSuccess && !errorMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Account created successfully! Please log in.
            </div>
          )}

          {/* Auth Error Message */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </div>
          )}

          <form action={dispatch} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg" 
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Log In
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">New User?</span>{' '}
            <Link href="/signup" className="font-semibold text-black hover:underline">
              Create an account
            </Link>
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          &copy; 2026 4th Booking Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
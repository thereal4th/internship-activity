'use client';

import Link from 'next/link';
import { CalendarCheck, LogOut } from 'lucide-react';
import { User } from '@/types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Header = ({ currentUser, onLogout }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LEFT: Home / Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-black p-1.5 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-black">
              4th
            </span>
          </Link>

          {/* RIGHT: Auth Actions */}
          <div className="flex items-center gap-6">
            {currentUser ? (
              // STATE: Logged In
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 hidden sm:block">
                  Hello, {currentUser.name}
                </span>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              // STATE: Logged Out
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-600 hover:text-black"
                >
                  Log In
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { PageView } from '../types';

interface HeaderProps {
  currentView: PageView;
  onChangeView: (view: PageView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { label: 'Home', view: PageView.LANDING },
    { label: 'Book Now', view: PageView.BOOKING },
    { label: 'My Bookings', view: PageView.MY_BOOKINGS },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => onChangeView(PageView.LANDING)}
          >
            <div className="bg-primary-600 p-1.5 rounded-lg">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              SlotSwift
            </span>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === item.view
                    ? 'text-primary-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="md:hidden flex items-center">
             {/* Mobile simplified nav - could expand to hamburger menu but keeping simple for this iteration */}
            <button 
              onClick={() => onChangeView(PageView.MY_BOOKINGS)}
              className="text-sm font-medium text-gray-500 hover:text-primary-600"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
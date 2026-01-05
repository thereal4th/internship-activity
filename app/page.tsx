'use client'

import Link from 'next/link'; 
import { Calendar, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { PageView } from '../types';

export default function LandingPage() { 
  return (
    <div className="flex flex-col min-h-screen">
      <Header currentView={PageView.LANDING} onChangeView={(view) => console.log('View changed to:', view)} />

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-normal bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent
          ">
            Booking made effortless.
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Schedule your appointments in seconds with our intuitive booking system.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            
            <Link href="/Booking"> 
              <Button size="lg" className="group bg-black">
                Book Appointment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/MyBookings"> 
              <Button size="lg" className="group bg-black">
                Manage Bookings
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Availability</h3>
            <p className="text-gray-500">View live slots and pick the date that works best for your schedule.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Confirmation</h3>
            <p className="text-gray-500">Receive immediate confirmation of your booking without the wait.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="h-12 w-12 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Management</h3>
            <p className="text-gray-500">Track all your appointments in one place and cancel anytime if needed.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
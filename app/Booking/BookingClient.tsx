'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, X, Clock } from 'lucide-react';
import { Button } from '@/components/Button'; 
import { createBookingAction } from '@/app/actions';
import { Booking } from '@/types';

interface Props {
  initialBookings: Booking[];
}

export default function BookingClient({ initialBookings }: Props) {
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper: Format date as YYYY-MM-DD (Local time, not UTC)
  const formatDateKey = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // 'en-CA' outputs YYYY-MM-DD
  };

  const currentDateKey = formatDateKey(selectedDate);

const isSlotBooked = (dateKey: string, time: string) => {
    const targetId = `${dateKey}_${time}`; //Matches exactly the string format saved in the DB.
    
    // Read directly from 'initialBookings'
    return initialBookings.some(b => {
        if (typeof b.slot === 'string') return b.slot === targetId;
        // Legacy check
        if (typeof b.slot === 'object' && b.slot !== null) {
            // @ts-expect-error handling legacy data
            return b.slot.id === targetId || b.slot === targetId;
        }
        return false;
    });
  };

  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const timeSlots = useMemo(() => {
    const slots = [];
    let currentTime = 9 * 60; // 9:00 AM
    const endTime = 17 * 60;   // 5:00 PM
    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentTime += 30;
    }
    return slots;
  }, []);

  // Calculate available slots
  // This re-calculates automatically whenever 'initialBookings' or 'currentDateKey' changes
  const bookedCount = timeSlots.filter(
    time => isSlotBooked(currentDateKey, time)
  ).length;

  const availableSlotsCount = timeSlots.length - bookedCount;

  const handleSlotClick = (time: string) => {
    setSelectedSlot(time);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setIsSubmitting(true);
    
    const slotId = `${currentDateKey}_${selectedSlot}`;     
    const result = await createBookingAction({ slot: slotId });

    if (result.success) {
      setIsModalOpen(false);
    
      router.refresh(); 
      router.push('/MyBookings');
    } else {
      alert(result.error || "Failed to save booking");
      setIsSubmitting(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
      if (!time) return "";
      const [h, m] = time.split(':');
      const hour = parseInt(h);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Select a Date & Time</h2>
          <p className="text-gray-500 mt-1">Times are shown in your local timezone.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: DATE SELECTOR */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Available Dates</h3>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {availableDates.map((date) => {
                  const isSelected = formatDateKey(date) === currentDateKey;
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                          : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                      }`}
                    >
                      <div>
                        <span className="block text-sm font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        </span>
                        <span className="block text-xs opacity-75">
                          {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      {isSelected && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TIME SLOTS */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <span className="text-sm text-gray-500">{availableSlotsCount} slots available</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const booked = isSlotBooked(currentDateKey, time);
                  return (
                    <button
                      key={time}
                      disabled={booked}
                      onClick={() => handleSlotClick(time)}
                      className={`
                        py-2 px-3 rounded-lg text-sm font-medium border transition-all
                        ${booked
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                          : 'bg-white text-blue-700 border-blue-200 hover:border-blue-500 hover:shadow-md active:scale-95'
                        }
                      `}
                    >
                        {time}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL SECTION */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-lg font-bold text-blue-700">
                        {selectedSlot ? formatTimeDisplay(selectedSlot) : ''}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  This booking will be associated with your account name and email address.
                </p>

                <div className="pt-2 flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors" disabled={isSubmitting}>
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
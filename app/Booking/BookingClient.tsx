'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, X, Clock } from 'lucide-react';
import { Button } from '@/components/Button'; // Ensure this path is correct
import { createBookingAction } from '@/app/actions';
import { Booking } from '@/types';

interface Props {
  initialBookings: Booking[];
}

export default function BookingClient({ initialBookings }: Props) {
  const router = useRouter();

  // 1. STATE: We initialize with new Date() immediately. 
  // Since this is a Client Component, it runs in the browser, so no hydration mismatch.
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. LOGIC: Use the prop passed from the Server instead of local state
  const bookings = initialBookings;

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const currentDateKey = formatDateKey(selectedDate);

  // 3. LOGIC: Updated to check against the MongoDB data structure
  const isSlotBooked = (dateKey: string, time: string) => {
    return bookings.some(b => b.slot.id === `${dateKey}_${time}`);
  };

  // Generate next 14 days
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

  // Generate 30min slots
  const timeSlots = useMemo(() => {
    const slots = [];
    let currentTime = 9 * 60; // 9:00 AM
    const endTime = 17 * 60; // 5:00 PM

    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      slots.push(timeString);
      currentTime += 30;
    }
    return slots;
  }, []);

  const handleSlotClick = (time: string) => {
    setSelectedSlot(time);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !name || !email) return;

    setIsSubmitting(true);
    
    // 4. ACTION: Call the real Server Action instead of storage.ts
    const result = await createBookingAction({
      user: { id: crypto.randomUUID(), name, email },
      slot: {
        id: `${currentDateKey}_${selectedSlot}`,
        date: currentDateKey,
        time: selectedSlot,
        isBooked: true
      }
    });

    if (result.success) {
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setSelectedSlot(null);
      // Next.js automatically updates the cache, so we just redirect
      router.push('/MyBookings');
    } else {
      alert(result.error || "Failed to save booking");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Select a Date & Time</h2>
        <p className="text-gray-500 mt-1">Times are shown in your local timezone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Date Selector */}
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
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
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

        {/* Time Slots */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <span className="text-sm text-gray-500">{timeSlots.length} slots available</span>
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
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed decoration-slice'
                        : 'bg-white text-primary-700 border-primary-200 hover:border-primary-500 hover:shadow-md active:scale-95'
                      }
                    `}
                  >
                    {booked ? (
                      <span className="line-through decoration-gray-400">{time}</span>
                    ) : (
                      time
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Booking</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
           
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-primary-50 rounded-lg p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-900">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-lg font-bold text-primary-700">{selectedSlot}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-primary-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
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

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const currentDateKey = formatDateKey(selectedDate);

  // FIX: slot is now a string (ISO) in our DB
  const isSlotBooked = (dateKey: string, time: string) => {
    const checkIso = new Date(`${dateKey}T${time}`).toISOString();
    return initialBookings.some(b => b.slot === checkIso);
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
    const endTime = 17 * 60; // 5:00 PM
    while (currentTime < endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      currentTime += 30;
    }
    return slots;
  }, []);

  const handleSlotClick = (time: string) => {
    setSelectedSlot(time);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setIsSubmitting(true);
    
    // FIX: Convert selection to the ISO string the DB expects
    const isoSlot = new Date(`${currentDateKey}T${selectedSlot}`).toISOString();

    // ACTION: Matches your createBookingAction(data: {slot: string})
    const result = await createBookingAction({ slot: isoSlot });

    if (result.success) {
      setIsModalOpen(false);
      router.push('/MyBookings');
    } else {
      alert(result.error || "Failed to save booking");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ... (Your Header and Date Selector UI is perfect, keep it as is) ... */}

      {/* Time Slots Grid */}
      <div className="lg:col-span-8">
          {/* ... existing UI ... */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((time) => {
                const booked = isSlotBooked(currentDateKey, time);
                return (
                  <button
                    key={time}
                    disabled={booked}
                    onClick={() => handleSlotClick(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      booked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : '...'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
          </div>
      </div>

      {/* Simplified Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Appointment</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
               <p className="text-blue-900 font-semibold">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
               <p className="text-2xl font-bold text-blue-700">{selectedSlot}</p>
            </div>

            <p className="text-gray-600 mb-6 text-sm">
              We will use your account name and email for this booking.
            </p>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { cancelBookingAction } from '@/app/actions';
import { Booking } from '@/types';

interface Props {
  initialBookings: Booking[];
}

export default function MyBookingsClient({ initialBookings }: Props) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // LOGIC: Sort bookings by parsing the ISO string slot
  const sortedBookings = useMemo(() => {
    return [...initialBookings].sort((a, b) => {
      return new Date(a.slot).getTime() - new Date(b.slot).getTime();
    });
  }, [initialBookings]);

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      setIsDeleting(id);
      
      const result = await cancelBookingAction(id);
      
      if (!result.success) {
        alert(result.error);
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-500 mt-1">Manage upcoming appointments.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          {sortedBookings.length} Active {sortedBookings.length === 1 ? 'Booking' : 'Bookings'}
        </div>
      </div>

      {sortedBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            You haven&apos;t made any appointments yet. Head over to the booking page to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBookings.map((booking) => {
             // DATA ACCESS FIX: Create date object from the ISO string
             const bookingDate = new Date(booking.slot);
             const isPast = bookingDate < new Date();
             const isThisDeleting = isDeleting === booking.id;
             
             return (
              <div
                key={booking.id}
                className={`
                  bg-white rounded-xl p-6 shadow-sm border border-gray-200
                  transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6
                  ${isPast ? 'opacity-75' : ''}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {bookingDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      {isPast && <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Past</span>}
                    </h3>
                    <div className="flex items-center text-gray-500 mt-1 gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {/* DATA ACCESS FIX: Extract time from the Date object */}
                        {bookingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{booking.user.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                      {booking.user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:self-center self-end">
                    {!isPast && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:border-red-200 border-gray-200"
                        onClick={() => handleCancel(booking.id)}
                        disabled={isThisDeleting}
                      >
                        {isThisDeleting ? (
                          <span className="flex items-center gap-2">
                            <div className="animate-spin h-3 w-3 border-b-2 border-red-600 rounded-full"></div>
                            Deleting...
                          </span>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
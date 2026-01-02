import { Booking } from '../types';

const STORAGE_KEY = 'slotswift_bookings';

export const getBookings = (): Booking[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse bookings from local storage", e);
    return [];
  }
};

export const saveBooking = (booking: Booking): void => {
  const current = getBookings();
  const updated = [...current, booking];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const deleteBooking = (id: string): void => {
  const current = getBookings();
  const updated = current.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const isSlotBooked = (date: string, time: string, bookings: Booking[]): boolean => {
  return bookings.some(b => b.slot.date === date && b.slot.time === time);
};
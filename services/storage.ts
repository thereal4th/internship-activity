// Import the 'Booking' type definition from a file located in the parent directory's 'types' folder.
// This ensures TypeScript knows what structure a 'Booking' object should have (e.g., id, date, name).
import { Booking } from '../types';

// Define a constant string to use as the key for Local Storage. 
// We use a variable so we don't have to type 'slotswift_bookings' every time and risk making a typo.
const STORAGE_KEY = 'IA_bookings';

// Export a function named 'getBookings' that takes no arguments and returns an array of 'Booking' objects.
export const getBookings = (): Booking[] => {
  // Start a 'try' block to handle potential errors safely (like if the data in storage is corrupted).
  try {
    // Attempt to retrieve the data string saved under our STORAGE_KEY from the browser's Local Storage.
    const stored = localStorage.getItem(STORAGE_KEY);
    
    // Check if 'stored' is not null (meaning data exists). 
    // If it exists, use JSON.parse() to convert the string back into a JavaScript array.
    // If it is null (no data found), return an empty array [].
    return stored ? JSON.parse(stored) : [];
    
  // If an error occurs inside the 'try' block (e.g., JSON.parse fails), jump to this 'catch' block.
  } catch (e) {
    // Log an error message to the browser console so developers can debug what went wrong.
    console.error("Failed to parse bookings from local storage", e);
    
    // Return an empty array so the app doesn't crash, effectively treating it as "no bookings found".
    return [];
  }
};

// Export a function named 'saveBooking' that accepts a single 'booking' object and returns nothing (void).
export const saveBooking = (booking: Booking): void => {
  // get the list of all currently existing bookings using the function we defined above.
  const current = getBookings();
  
  // Create a new array named 'updated'. 
  // The '...' (spread operator) copies all items from 'current' into this new array, 
  // and then adds the new 'booking' to the end.
  const updated = [...current, booking];
  
  // Save this new 'updated' array back to Local Storage.
  // We must use JSON.stringify() because Local Storage can only save strings, not arrays or objects.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// Export a function named 'deleteBooking' that takes a booking 'id' (string) and returns nothing (void).
export const deleteBooking = (id: string): void => {
  // specific logic: First, retrieve all current bookings.
  const current = getBookings();
  
  // Create a new array named 'updated' by filtering the current list.
  // The logic `b.id !== id` keeps only the bookings where the ID does NOT match the one we want to delete.
  const updated = current.filter(b => b.id !== id);
  
  // Save the filtered list (which now lacks the deleted item) back to Local Storage as a string.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

// Export a function named 'isSlotBooked' that takes a date, a time, and the list of bookings, returning a boolean (true/false).
export const isSlotBooked = (date: string, time: string, bookings: Booking[]): boolean => {
  // Use the .some() array method, which checks if AT LEAST ONE item in the array meets the condition.
  // It returns 'true' if it finds a booking with the exact same date AND exact same time.
  return bookings.some(b => b.slot.date === date && b.slot.time === time);
};
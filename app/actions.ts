'use server'

import { connectDB } from '@/lib/db';
import { BookingModel } from '@/Models/Booking'
import { UserModel } from '@/Models/User'
import { Booking, PopulatedRawBooking, User, RawUser } from '@/types'
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';

// 1. DEFINE THE SHAPE OF YOUR LEGACY DATA
interface LegacySlot {
  id?: string;
  date?: string;
  time?: string;
}

// 2. DEFINE THE UNION TYPE (The slot can be a String OR a Legacy Object)
type DbSlot = string | LegacySlot | null | undefined;

// 3. SAFE TYPE OVERRIDE FOR MONGOOSE DOCUMENTS
// This tells TS: "The doc is like PopulatedRawBooking, but 'slot' is definitely mixed."
interface SafeBookingDoc extends Omit<PopulatedRawBooking, 'slot'> {
  slot: DbSlot;
}

/**
 * Helper: Type Guard to check if a slot is the legacy object format
 */
function isLegacySlot(slot: unknown): slot is LegacySlot {
  return typeof slot === 'object' && slot !== null;
}

function getSlotString(slot: unknown): string {
    if (!slot) return "";
    
    if (typeof slot === 'string') {
        return slot;
    }
    
    if (isLegacySlot(slot)) {
        if (slot.id) return slot.id;
        // Fallback for object without ID
        return JSON.stringify(slot);
    }

    return String(slot);
}

function normalizeSlot(slot: unknown): string {
    try {
        if (!slot && slot !== '') return '';

        // CASE A: It's a string (New Format or ISO)
        if (typeof slot === 'string') {
            // "2026-01-05_09:00" => local -> UTC
            if (/^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/.test(slot)) {
                return new Date(slot.replace('_','T') + ':00').toISOString();
            }
            // try parse string
            const d = new Date(slot);
            if (!isNaN(d.getTime())) return d.toISOString();
            return slot;
        }

        // CASE B: It's a Legacy Object
        if (isLegacySlot(slot)) {
            // Handle { date: "...", time: "..." }
            if (slot.date && slot.time) {
                return new Date(`${slot.date}T${slot.time}:00`).toISOString();
            }
            // Handle { id: "2026-01-05_09:00" }
            if (slot.id && typeof slot.id === 'string') {
                const parsed = slot.id.replace('_','T') + ':00';
                return new Date(parsed).toISOString();
            }
            return ""; 
        }

        return String(slot);
    } catch (e) {
        console.error("Normalization error:", e);
        return "";
    }
}

export async function createBookingAction(data: { slot: string }) {
    try {
        const session = await auth();
        if (!session || !session.user) return { success: false, error: "Please log in first." };

        await connectDB();
        
        const isBooked = await BookingModel.findOne({ slot: data.slot });
        if (isBooked) return { success: false, error: "Slot is already booked" };

        await BookingModel.create({
            user: session.user.id,
            slot: data.slot 
        });

        revalidatePath('/Booking');
        revalidatePath('/MyBookings');
        return { success: true };
    }
    catch (error) {
        console.log("Could not create booking: ", error);
        return { success: false, error: "Database save failed" };
    }
}

// VIEW BOOKINGS OF ONE USER
export async function getBookingsAction() {
    try {
        const session = await auth();
        if (!session || !session.user) return [];

        await connectDB();

        // Use the SafeBookingDoc generic here to handle the mixed slot type
        const docs = await BookingModel.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .populate('user') 
            .lean<SafeBookingDoc[]>(); 

        return docs.map((doc) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            // No 'as any' needed -> TS knows doc.slot is DbSlot
            slot: normalizeSlot(doc.slot), 
            createdAt: doc.createdAt.getTime(),
        })) as Booking[];
    }
    catch (error) {
        console.log("Fetch failed:", error);
        return []
    }
}

// VIEW ALL BOOKINGS
export async function getAllBookingsAction() {
    try {
        await connectDB();
        
        // Use SafeBookingDoc generic
        const docs = await BookingModel.find({})
            .populate('user') 
            .lean<SafeBookingDoc[]>();

        return docs.map((doc) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            slot: getSlotString(doc.slot),
            createdAt: doc.createdAt.getTime(),
        })) as Booking[];
    } catch (error) {
        console.log("Could not get bookings: ", error)
        return [];
    }
}

export async function cancelBookingAction(bookingId: string) {
    try {
        await connectDB();
        await BookingModel.findByIdAndDelete(bookingId);

        revalidatePath('/MyBookings'); 
        revalidatePath('/Booking');

        return { success: true }
    }
    catch (error) {
        console.log("Failed to delete booking: ", error);
        return { success: false, error: "Cancellation failed." }
    }
}

export async function getUsersAction(){
    try{
        await connectDB();

        const users = await UserModel.find({}).sort({createdAt: -1}).lean<RawUser[]>();

        return users.map((user) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.getTime(),
        })) as User[]; 
    }
    catch(error){
        console.log("Failed to get users", error)
        return []
    }
}
'use server'

import { connectDB } from '@/lib/db';
import { BookingModel } from '@/Models/Booking'
import { UserModel } from '@/Models/User'
import { Booking, PopulatedRawBooking, User, RawUser } from '@/types'
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';

function normalizeSlot(slot: any): string {
    try {
        if (!slot && slot !== '') return '';
        if (typeof slot === 'string') {
            // "2026-01-05_09:00" => local -> UTC
            if (/^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/.test(slot)) {
                return new Date(slot.replace('_','T') + ':00').toISOString();
            }
            // try parse string (may be ISO with/without Z or other)
            const d = new Date(slot);
            if (!isNaN(d.getTime())) return d.toISOString();
            return String(slot);
        }
        if (typeof slot === 'object' && slot !== null) {
            if (slot.date && slot.time) {
                return new Date(`${slot.date}T${slot.time}:00`).toISOString();
            }
            if (slot.id && typeof slot.id === 'string') {
                const parsed = slot.id.replace('_','T') + ':00';
                return new Date(parsed).toISOString();
            }
            return String(slot);
        }
        return String(slot);
    } catch (e) {
        return String(slot);
    }
}

export async function createBookingAction(data: { slot: string }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return { success: false, error: "Please log in first." }
        }

        await connectDB();
        
        // Parse incoming slot (assume it's local if it lacks timezone) and convert to canonical UTC ISO
        const parsed = new Date(data.slot);
        if (isNaN(parsed.getTime())) {
            return { success: false, error: "Invalid slot format" };
        }
        const standardizedSlot = parsed.toISOString(); // canonical UTC ISO

        const isBooked = await BookingModel.findOne({ slot: standardizedSlot });
        if (isBooked) {
            return { success: false, error: "Slot is already booked" }
        }

        const newBooking = await BookingModel.create({
            user: session.user.id,
            slot: standardizedSlot
        });

        revalidatePath('/MyBookings'); 
        revalidatePath('/Booking');

        return { success: true, id: newBooking._id.toString() };
    }
    catch (error) {
        console.log("Booking could not be created: ", error);
        return { success: false, error: "Database save failed" };
    }
}

//view bookings of one user
export async function getBookingsAction() {
    try {
        const session = await auth();
        if (!session || !session.user) return [];

        await connectDB();

        const docs = await BookingModel.find({ user: session.user.id })
            .sort({ createdAt: -1 })
            .populate('user') 
            .lean<PopulatedRawBooking[]>();

        return docs.map((doc: PopulatedRawBooking) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            slot: normalizeSlot((doc as any).slot),
            createdAt: doc.createdAt.getTime(),
        })) as Booking[];
    }
    catch (error) {
        console.log("Fetch failed:", error);
        return []
    }
}

//view ALL bookings for ALL users
export async function getAllBookingsAction() {
    try {
        await connectDB();

        const docs = await BookingModel.find({})
            .sort({ createdAt: -1 })
            .populate('user') 
            .lean<PopulatedRawBooking[]>();

        return docs.map((doc: PopulatedRawBooking) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            slot: normalizeSlot((doc as any).slot),
            createdAt: doc.createdAt.getTime(),
        })) as Booking[];
    }
    catch (error) {
        console.log("Fetch all failed:", error);
        return [];
    }
}

export async function cancelBookingAction(bookingId: string) {
    try {
        await connectDB();
        await BookingModel.findByIdAndDelete(bookingId);

        // FIXED PATHS
        revalidatePath('/MyBookings'); 
        revalidatePath('/Booking');

        return { success: true }
    }
    catch (error) {
        console.log("Failed to delete booking: ", error);
        return { success: false, error: "Cancellation failed." }
    }
}

//ACTION: get all users (for admins)
//TODO: add check if user is an admin
export async function getUsersAction(){

    try{
        await connectDB();

        const users = await UserModel.find({}).sort({createdAt: -1}).lean<RawUser[]>();

        return users.map((user: RawUser) => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            createdAt: user.createdAt.getTime(),
        })) as User[]; //return array of users
    }
    catch(error){
        console.log("Failed to get users", error)
        return []
    }
}

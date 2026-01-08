'use server'

import { connectDB } from '@/lib/db';
import { BookingModel } from '@/Models/Booking'
import { UserModel } from '@/Models/User'
import { Booking, PopulatedRawBooking, User, RawUser } from '@/types'
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';


function formatSlotToIso(slot: string): string {
    try {
        if (!slot && slot !== '') return '';

        // "2026-01-05_09:00" => local -> UTC
        if (/^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/.test(slot)) {
            return new Date(slot.replace('_','T') + ':00').toISOString();
        }
        // try parse string
        const d = new Date(slot);
        if (!isNaN(d.getTime())) return d.toISOString();

        return slot;
    } catch (e) {
        console.error("Normalization error:", e);
        return "";
    }
}

export async function createBookingAction(data: { slot: string }) {
    try {
        const session = await auth();
        if (!session || !session.user) return { success: false, error: "Please log in first." };

        //check if incoming slot matches expected date string format
        if (!/^\d{4}-\d{2}-\d{2}_\d{2}:\d{2}$/.test(data.slot)){
            return {success: false, error: "Invalid slot date format"};
        }

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
            .lean<PopulatedRawBooking[]>(); 

        return docs.map((doc) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            // No 'as any' needed -> TS knows doc.slot is DbSlot
            slot: formatSlotToIso(doc.slot), 
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
            .lean<PopulatedRawBooking[]>();

        return docs.map((doc) => ({
            id: doc._id.toString(),
            user: {
                id: doc.user._id.toString(),
                name: doc.user.name,
                email: doc.user.email
            },
            slot: doc.slot,
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
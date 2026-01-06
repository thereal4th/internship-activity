'use server'

import { connectDB } from '@/lib/db';
import { BookingModel } from '@/Models/Booking'
import { UserModel } from '@/Models/User'
import { Booking, PopulatedRawBooking, User, RawUser } from '@/types'
import { revalidatePath } from 'next/cache';
import { auth } from '@/app/auth';

export async function createBookingAction(data: { slot: string }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return { success: false, error: "Please log in first." }
        }

        await connectDB();
        
        const isBooked = await BookingModel.findOne({ slot: data.slot });
        if (isBooked) {
            return { success: false, error: "Slot is already booked" }
        }

        const newBooking = await BookingModel.create({
            user: session.user.id,
            slot: data.slot
        });

        //revalidate cache
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

        // LOGIC: Filter by user ID so the user only sees their bookings
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
            slot: doc.slot,
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

        // Notice: No { user: id } filter here. We want everything.
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
            slot: doc.slot,
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

//safe user, we extend this in the schema with password and createdAt fields
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Slot {
    id: string; //Format should be YYYY-MM-DD_HH:mm
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    isBooked: boolean;
}

export interface Booking {
    id: string;
    slot: Slot
    user: User;
    createdAt: number; //easier to work with than Date for next.js 
}

//define the shape of raw booking as it exists in the db
export interface RawBooking {
    _id: {toString: () => string}; //mongodb ids are objects
    user: User;
    slot: Slot;
    createdAt: Date; //in the DB, this is a Date object not a number (mongodb is optimized for Date objects)
}

//same with the user
export interface RawUser {
    _id: {toString: () => string};
    name: string;
    email: string;
    createdAt: Date;
}

/*export enum PageView {
    LANDING = 'LANDING',
    BOOKING = 'BOOKING',
    MY_BOOKINGS = 'MY_BOOKINGS',
    LOGIN = 'LOGIN',
    SIGN_UP = 'SIGN_UP'
}*/


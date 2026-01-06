//safe user, we extend this in the schema with password and createdAt fields
export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: number;
}

/*
removed id, time, and isbooked, slot is just a date string now
export interface Slot {
    id: string; //Format should be YYYY-MM-DD_HH:mm
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    isBooked: boolean;
}
*/

export interface Booking {
    id: string;
    slot: string;
    user: Omit<User, 'createdAt'>, //inherit User but remove createdAt, unnecessary
    createdAt: number; //easier to work with than Date for next.js 
}

//define the shape of raw booking as it exists in the db
export interface RawBooking {
    _id: {toString: () => string}; //mongodb ids are objects
    user: {toString: () => string}; //comes from the DB as an ObjectID reference
    slot: string;
    createdAt: Date; //in the DB, this is a Date object not a number (mongodb is optimized for Date objects)
}

export interface PopulatedRawBooking {
    _id: { toString: () => string };
    user: {
        _id: { toString: () => string };
        name: string;
        email: string;
    };
    slot: string;
    createdAt: Date;
}

//same with the user
export interface RawUser {
    _id: {toString: () => string};
    name: string;
    password?: string; //optional
    email: string;
    createdAt: Date;
}



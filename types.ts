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
    createdAt: number;
}

export enum PageView {
    LANDING = 'LANDING',
    BOOKING = 'BOOKING',
    MY_BOOKINGS = 'MY_BOOKINGS'
}

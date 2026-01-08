import {getBookingsAction} from '@/app/actions/bookingActions';
import MyBookingsClient from './MyBookingsClient';

export default async function MyBookingsPage(){

  const bookings = await getBookingsAction();

  return <MyBookingsClient initialBookings={bookings}/>;
}
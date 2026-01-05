import {getBookingsAction} from '@/app/actions';
import MyBookingsClient from './MyBookingsClient';

export default async function MyBookingsPage(){

  const bookings = await getBookingsAction();

  return <MyBookingsClient initialBookings={bookings}/>;
}
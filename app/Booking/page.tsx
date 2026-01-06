import {getAllBookingsAction} from '@/app/actions'
import BookingClient from './BookingClient';

export default async function BookingPage(){
  //fetch existing bookings from DB before loading UI
  const initialBookings = await getAllBookingsAction();  

  return <BookingClient initialBookings={initialBookings}/>;
}
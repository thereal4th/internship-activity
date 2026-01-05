import {getBookingsAction} from '@/app/actions'
import BookingClient from './BookingClient';


export default async function BookingPage(){
  //fetch existing bookings from DB before loading UI
  const initialBookings = await getBookingsAction();

  return <BookingClient initialBookings={initialBookings}/>;
}
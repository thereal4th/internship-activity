import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db'; // Importing your default export

// This forces Next.js to not cache this route, ensuring live data
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return new NextResponse("Date parameter is required", { status: 400 });
    }

    // 1. Connect to the database
    const client = await clientPromise;
    const db = client.db(); // Uses the DB name from your connection string

    // 2. Query the 'bookings' collection
    // We use a Regex to find slots that start with the date string (e.g. "2026-01-06_...")
    // Note: Ensure your collection is named "bookings" (lowercase, plural) in MongoDB. 
    // If you used Mongoose to create it, it's likely "bookings".
    const bookings = await db.collection('bookings').find({
      slot: { $regex: `^${date}` } 
    }).toArray();

    // 3. Return the data
    return NextResponse.json(bookings);

  } catch (error) {
    console.error("[BOOKINGS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
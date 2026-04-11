import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';

/**
 * Handle POST request for booking form submission
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, destination, dateTime, name, contact } = body;

    // Basic validation
    if (!from || !destination || !dateTime || !name || !contact) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const newBooking = await Booking.create({
      from,
      destination,
      dateTime: new Date(dateTime),
      name,
      contact,
      status: 'pending',
    });

    return NextResponse.json(
      {
        message: 'Booking request received successfully',
        booking: newBooking,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Booking API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle GET request to fetch all bookings (Admin only)
 */
export async function GET() {
  try {
    await connectToDatabase();
    const bookings = await Booking.find({}).sort({ createdAt: -1 });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Handle PATCH request to update booking status
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error: any) {
    console.error('Update Booking Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

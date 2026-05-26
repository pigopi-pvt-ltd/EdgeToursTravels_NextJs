
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import { verifyToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') {
    return NextResponse.json({ error: 'Only drivers can complete trips' }, { status: 403 });
  }

  await connectToDatabase();
  const { id } = await params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not your trip' }, { status: 403 });
  }

  if (!booking.tripStarted) {
    return NextResponse.json({ error: 'Trip not started yet' }, { status: 400 });
  }

  if (booking.tripCompleted) {
    return NextResponse.json({ error: 'Trip already completed' }, { status: 400 });
  }

  // Complete trip
  booking.tripCompleted = true;
  booking.tripEndTime = new Date();
  booking.status = 'completed';
  
  if (booking.tripStartTime) {
    booking.actualDuration = Math.round(
      (booking.tripEndTime.getTime() - booking.tripStartTime.getTime()) / 60000
    );
  }
  
  await booking.save();

  // Make driver available again
  await User.findByIdAndUpdate(payload.userId, {
    'driverDetails.availabilityStatus': 'available'
  });

  // Make vehicle available again
  if (booking.vehicleId) {
    await Vehicle.findByIdAndUpdate(booking.vehicleId, { 
      isAvailable: true,
      currentBookingId: null,
      currentDriverId: null
    });
  }

  // Notify customer
  if (booking.userId) {
    await sendNotification({
      userId: booking.userId.toString(),
      bookingId: booking._id.toString(),
      type: 'trip_completed',
      title: 'Trip Completed',
      message: `Your trip from ${booking.from} to ${booking.destination} has been completed. Thank you for choosing Edge Tours!`,
      metadata: { from: booking.from, to: booking.destination, duration: booking.actualDuration },
    });
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Trip completed successfully',
    actualDuration: booking.actualDuration
  });
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
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
    return NextResponse.json({ error: 'Only drivers can start trips' }, { status: 403 });
  }

  await connectToDatabase();
  const { id } = await params;
  const { otp } = await req.json();

  if (!otp) {
    return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not your trip' }, { status: 403 });
  }

  if (booking.tripStarted) {
    return NextResponse.json({ error: 'Trip already started' }, { status: 400 });
  }

  if (!booking.otp || booking.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  if (new Date() > new Date(booking.otpExpiry)) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  }

  // Start trip
  booking.tripStarted = true;
  booking.tripStartTime = new Date();
  booking.status = 'in-progress';
  booking.otp = undefined;
  booking.otpExpiry = undefined;
  await booking.save();

  // Update driver availability
  await User.findByIdAndUpdate(payload.userId, {
    'driverDetails.availabilityStatus': 'unavailable'
  });

  // Notify customer
  if (booking.userId) {
    await sendNotification({
      userId: booking.userId.toString(),
      bookingId: booking._id.toString(),
      type: 'trip_accepted',
      title: 'Trip Started',
      message: `Your trip from ${booking.from} to ${booking.destination} has started.`,
      metadata: { from: booking.from, to: booking.destination },
    });
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Trip started successfully',
    tripStartTime: booking.tripStartTime
  });
}
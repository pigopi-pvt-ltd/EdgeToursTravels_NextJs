import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const { id } = await params;

  const booking = await Booking.findById(id)
    .populate('driverId', 'name mobileNumber')
    .populate('vehicleId', 'cabNumber modelName');

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  // Authorization
  if (payload.role === 'customer') {
    const user = await User.findById(payload.userId);
    if (booking.userId?.toString() !== payload.userId && booking.contact !== user?.mobileNumber) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (payload.role === 'driver') {
    if (booking.driverId?._id?.toString() !== payload.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json({
    tripStarted: booking.tripStarted,
    tripCompleted: booking.tripCompleted,
    currentLocation: booking.currentLocation,
    driver: booking.driverId,
    vehicle: booking.vehicleId,
    from: booking.from,
    destination: booking.destination,
    tripStartTime: booking.tripStartTime,
    tripEndTime: booking.tripEndTime,
    actualDuration: booking.actualDuration,
  });
}
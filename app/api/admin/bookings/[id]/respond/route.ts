import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const { id } = await params;
  const { response } = await req.json(); // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(response)) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not your assigned trip' }, { status: 403 });
  }

  booking.driverResponse = response;
  if (response === 'accepted') {
    booking.status = 'confirmed';
  } else {
    booking.status = 'pending'; // admin can reassign
  }
  await booking.save();

  // Notify customer if exists
  if (booking.userId) {
    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: response === 'accepted' ? 'Trip Accepted' : 'Trip Rejected',
      message: response === 'accepted'
        ? `Your trip from ${booking.from} to ${booking.destination} has been accepted by the driver.`
        : `The driver has rejected your trip from ${booking.from} to ${booking.destination}. Admin will assign another driver.`,
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
    });
  }

  // Notify admin
  const adminUser = await User.findOne({ role: 'admin' });
  if (adminUser) {
    await Notification.create({
      userId: adminUser._id,
      bookingId: booking._id,
      title: response === 'accepted' ? 'Trip Accepted by Driver' : 'Trip Rejected by Driver',
      message: `Driver ${payload.userId} has ${response} trip #${booking._id}.`,
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
    });
  }

  return NextResponse.json({ message: `Trip ${response}`, booking });
}
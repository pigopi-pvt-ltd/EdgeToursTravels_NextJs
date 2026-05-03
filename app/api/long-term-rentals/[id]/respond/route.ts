import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LongTermRental from '@/models/LongTermRental';
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
    return NextResponse.json({ error: 'Only drivers can respond' }, { status: 403 });
  }

  await connectToDatabase();
  const { id } = await params;
  const { response } = await req.json();

  if (!['accepted', 'rejected'].includes(response)) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
  }

  const rental = await LongTermRental.findById(id);
  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 });
  if (rental.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not assigned to you' }, { status: 403 });
  }

  rental.status = response === 'accepted' ? 'assigned' : 'pending';
  await rental.save();

  // Notify admin – 'trip_accepted' / 'trip_rejected'
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    await sendNotification({
      userId: admin._id.toString(),
      bookingId: rental._id.toString(),
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
      title: `Driver ${response} rental`,
      message: `Driver ${payload.userId} has ${response} the rental request.`,
    });
  }

  // Notify customer 
  const customer = await User.findById(rental.userId);
  if (customer) {
    await sendNotification({
      userId: customer._id.toString(),
      bookingId: rental._id.toString(),
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
      title: response === 'accepted' ? 'Driver Accepted Your Rental' : 'Driver Rejected Your Rental',
      message: response === 'accepted'
        ? 'The assigned driver has accepted your rental request.'
        : 'The driver rejected your rental request. Admin will assign another driver.',
    });
  }

  return NextResponse.json({ message: `Rental ${response}`, rental });
}
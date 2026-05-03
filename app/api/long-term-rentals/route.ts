import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LongTermRental from '@/models/LongTermRental';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  let filter = {};
  if (payload.role !== 'admin') {
    filter = { userId: payload.userId };
  }

  const rentals = await LongTermRental.find(filter)
    .populate('userId', 'name email mobileNumber')
    .populate('driverId', 'name email mobileNumber')
    .populate('vehicleId', 'cabNumber modelName')
    .sort({ createdAt: -1 });
  return NextResponse.json(rentals);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'customer') {
    return NextResponse.json({ error: 'Only customers can request rentals' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, vehicleId, from, destination, startDate, endDate, name, contact, price, notes } = body;
  if (!userId || !vehicleId || !from || !destination || !startDate || !endDate || !name || !contact || !price) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await connectToDatabase();

  const rental = await LongTermRental.create({
    userId,
    vehicleId,
    from,
    destination,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    name,
    contact,
    price,
    notes,
    status: 'pending',
  });

  // Notify admin – 'booking_created' type
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    await sendNotification({
      userId: admin._id.toString(),
      bookingId: rental._id.toString(),   // use bookingId instead of rentalId
      type: 'booking_created',
      title: 'New Long‑term Rental Request',
      message: `${name} requested a rental from ${from} to ${destination}`,
      metadata: { rentalId: rental._id.toString() },
    });
  }

  return NextResponse.json(rental, { status: 201 });
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, destination, dateTime, name, contact, userId } = body;

    if (!from || !destination || !dateTime || !name || !contact) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const newBooking = await Booking.create({
      from,
      destination,
      dateTime: new Date(dateTime),
      name,
      contact,
      status: 'pending',
      userId: userId || null,
    });

    return NextResponse.json({ message: 'Booking created', booking: newBooking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  let filter = {};
  if (payload.role === 'admin') filter = {};
  else if (payload.role === 'driver') filter = { driverId: payload.userId };
  else if (payload.role === 'customer') filter = { userId: payload.userId };
  else return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const bookings = await Booking.find(filter)
    .populate('driverId', 'name email mobileNumber')
    .populate('userId', 'name email')
    .populate('vehicleId', 'cabNumber modelName')   // ← ADD THIS LINE
    .sort({ dateTime: -1 });
  return NextResponse.json(bookings);
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status, driverId, vehicleId } = await req.json();
  if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

  await connectToDatabase();
  const updateData: any = {};
  if (status) updateData.status = status;
  if (driverId) updateData.driverId = driverId;
  if (vehicleId) updateData.vehicleId = vehicleId;

  const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedBooking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  return NextResponse.json(updatedBooking);
}
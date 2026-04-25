import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  let filter = {};
  
  if (payload.role === 'admin' || payload.role === 'employee') {
    filter = {};
  } 
  else if (payload.role === 'driver') {
    filter = { driverId: payload.userId };
  } 
  else if (payload.role === 'customer') {
    const user = await User.findById(payload.userId).select('mobileNumber');
    if (user && user.mobileNumber) {
      filter = {
        $or: [
          { userId: payload.userId },
          { contact: user.mobileNumber }
        ]
      };
    } else {
      filter = { userId: payload.userId };
    }
  } 
  else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const bookings = await Booking.find(filter)
      .populate('driverId', 'name email mobileNumber')
      .populate('userId', 'name email')
      .populate('vehicleId', 'cabNumber modelName') // ✅ Now works
      .sort({ dateTime: -1 });
    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error('Booking fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, destination, dateTime, name, contact, userId, price } = body;

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
      price,
      status: 'pending',
      userId: userId || null,
    });

    return NextResponse.json({ message: 'Booking created', booking: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
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
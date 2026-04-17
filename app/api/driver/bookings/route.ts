import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // pending, confirmed, completed, cancelled

  const filter: any = { driverId: payload.userId };
  if (status) filter.status = status;

  const bookings = await Booking.find(filter)
    .populate('userId', 'name email mobileNumber')
    .sort({ dateTime: 1 });

  return NextResponse.json(bookings);
}
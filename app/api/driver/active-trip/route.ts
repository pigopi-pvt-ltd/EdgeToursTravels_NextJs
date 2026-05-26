import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectToDatabase();

  const activeTrip = await Booking.findOne({
    driverId: payload.userId,
    status: { $in: ['confirmed', 'in-progress'] },
    tripCompleted: false,
  })
    .populate('vehicleId', 'cabNumber modelName')
    .populate('userId', 'name email mobileNumber');

  return NextResponse.json({ trip: activeTrip || null });
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  if (payload.role !== 'driver') {
    return NextResponse.json({ error: 'Only drivers can update availability' }, { status: 403 });
  }

  const { status } = await req.json();
  if (!status || !['available', 'unavailable'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectToDatabase();
  const driver = await User.findById(payload.userId);
  if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

  // Ensure driverDetails exists – non‑null assertion is safe because we check above
  if (!driver.driverDetails) {
    driver.driverDetails = {} as any;
  }
  // Use non‑null assertion to tell TypeScript it's now defined
  driver.driverDetails!.availabilityStatus = status;
  await driver.save();

  return NextResponse.json({ message: 'Availability updated', status });
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const driver = await User.findById(id);
  if (!driver || driver.role !== 'driver') return NextResponse.json({ error: 'Driver not found' }, { status: 404 });

  // Merge driverDetails
  driver.driverDetails = { ...driver.driverDetails, ...body };
  await driver.save();
  return NextResponse.json(driver);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const driver = await User.findById(id);
  if (!driver || driver.role !== 'driver') return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
  await driver.deleteOne();
  return NextResponse.json({ success: true });
}
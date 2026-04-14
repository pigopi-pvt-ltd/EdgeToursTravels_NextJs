import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyToken } from '@/lib/jwt';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

  // Update fields
  Object.assign(vehicle, {
    ...body,
    yearOfMaking: body.yearOfMaking ? Number(body.yearOfMaking) : vehicle.yearOfMaking,
    expiryDate: body.expiryDate ? new Date(body.expiryDate) : vehicle.expiryDate,
    vendor: { ...vehicle.vendor, ...body.vendor, dob: body.vendor?.dob ? new Date(body.vendor.dob) : vehicle.vendor.dob }
  });
  await vehicle.save();
  return NextResponse.json(vehicle);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await Vehicle.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
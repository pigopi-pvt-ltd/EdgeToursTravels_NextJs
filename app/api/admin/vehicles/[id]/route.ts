import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const { id } = await params;
  const body = await req.json();
  
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  
  // Convert dates if present
  if (body.dob) body.dob = new Date(body.dob);
  if (body.expiryDate) body.expiryDate = new Date(body.expiryDate);
  if (body.yearMaking) body.yearMaking = Number(body.yearMaking);
  
  Object.assign(vehicle, body);
  await vehicle.save();
  
  return NextResponse.json(vehicle);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const { id } = await params;
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  
  return NextResponse.json({ success: true });
}
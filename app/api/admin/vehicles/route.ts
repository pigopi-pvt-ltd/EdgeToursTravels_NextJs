import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const body = await req.json();
  
  // Required fields from frontend
  const required = ['vendorName', 'mobile', 'cabNumber', 'licenceNumber', 'insuranceNo', 'modelName'];
  for (const field of required) {
    if (!body[field]) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  
  // Check uniqueness
  const existing = await Vehicle.findOne({ $or: [{ cabNumber: body.cabNumber }, { licenceNumber: body.licenceNumber }] });
  if (existing) return NextResponse.json({ error: 'Cab number or licence number already exists' }, { status: 400 });
  
  // Convert dates
  const vehicleData = {
    ...body,
    dob: body.dob ? new Date(body.dob) : undefined,
    expiryDate: new Date(body.expiryDate),
    yearMaking: Number(body.yearMaking),
  };
  
  const vehicle = await Vehicle.create(vehicleData);
  return NextResponse.json(vehicle, { status: 201 });
}
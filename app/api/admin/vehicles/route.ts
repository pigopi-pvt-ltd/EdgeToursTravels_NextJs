import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const vehicles = await Vehicle.find().sort({ createdAt: -1 });
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { cabNumber, tacNo, licenseNo, pollutionNo, gstNo, insuranceNo, modelName,
          expiryDate, yearOfMaking, status, vendor } = body;

  const existing = await Vehicle.findOne({ $or: [{ cabNumber }, { licenseNo }] });
  if (existing) return NextResponse.json({ error: 'Cab number or license already exists' }, { status: 400 });

  const vehicle = await Vehicle.create({
    cabNumber, tacNo, licenseNo, pollutionNo, gstNo, insuranceNo, modelName,
    expiryDate: new Date(expiryDate), yearOfMaking: Number(yearOfMaking), status,
    vendor: {
      ...vendor,
      dob: new Date(vendor.dob)
    }
  });
  return NextResponse.json(vehicle, { status: 201 });
}
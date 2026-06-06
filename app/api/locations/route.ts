import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Location from '@/models/Location';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const locations = await Location.find({}).sort({ createdAt: -1 });
    return NextResponse.json(locations);
  } catch (error: any) {
    console.error('GET locations error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, address, city, state, zipCode, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Location name is required' }, { status: 400 });
    }

    const existing = await Location.findOne({ name });
    if (existing) {
      return NextResponse.json({ error: 'Location with this name already exists' }, { status: 400 });
    }

    const location = await Location.create({
      name,
      address,
      city,
      state,
      zipCode,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    console.error('POST location error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

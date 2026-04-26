
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json(vehicle);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const body = await req.json();

  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }

  // Check uniqueness if cab number is changed
  if (body.cabNumber && body.cabNumber !== vehicle.cabNumber) {
    const existingCab = await Vehicle.findOne({ cabNumber: body.cabNumber, _id: { $ne: id } });
    if (existingCab) {
      return NextResponse.json({ error: 'Cab number already exists' }, { status: 400 });
    }
  }

  // Check uniqueness if license number is changed
  const newLicense = body.licenseNo || body.licenceNumber;
  if (newLicense && newLicense !== vehicle.licenseNo) {
    const existingLicense = await Vehicle.findOne({ licenseNo: newLicense, _id: { $ne: id } });
    if (existingLicense) {
      return NextResponse.json({ error: 'License number already exists' }, { status: 400 });
    }
  }

  // Convert dates and numbers
  if (body.dob) body.dob = new Date(body.dob);
  if (body.vendor?.dob) body.vendor.dob = new Date(body.vendor.dob);
  if (body.expiryDate) body.expiryDate = new Date(body.expiryDate);
  if (body.yearMaking) body.yearMaking = Number(body.yearMaking);
  if (body.yearOfMaking) body.yearOfMaking = Number(body.yearOfMaking);

  // Handle license number alias
  if (body.licenceNumber && !body.licenseNo) {
    body.licenseNo = body.licenceNumber;
  }

  try {
    Object.assign(vehicle, body);
    await vehicle.save();
    return NextResponse.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    console.error('Vehicle update error:', error);
    return NextResponse.json({ error: 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const vehicle = await Vehicle.findByIdAndDelete(id);
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
}
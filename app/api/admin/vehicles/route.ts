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
  const requiredVendor = ['vendorName', 'mobile', 'gender', 'address', 'aadhar', 'dob', 'pan', 'email'];
  const requiredVehicle = ['cabNumber', 'licenseNo', 'insuranceNo', 'modelName', 'expiryDate', 'yearOfMaking'];
  for (const field of requiredVendor) {
    const value = body.vendor?.[field] ?? body[field];
    if (!value) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  for (const field of requiredVehicle) {
    const aliasKey = field === 'licenseNo' ? 'licenceNumber' : field === 'yearOfMaking' ? 'yearMaking' : field;
    const value = body[field] ?? body[aliasKey];
    if (!value) return NextResponse.json({ error: `${field} is required` }, { status: 400 });
  }
  
  const licenseNo = body.licenseNo || body.licenceNumber;
  const tacNo = body.tacNo || body.racNo;
  
  // Check uniqueness
  const existing = await Vehicle.findOne({ $or: [{ cabNumber: body.cabNumber }, { licenseNo }] });
  if (existing) return NextResponse.json({ error: 'Cab number or licence number already exists' }, { status: 400 });
  
  const vehicleData = {
    cabNumber: body.cabNumber,
    tacNo,
    licenseNo,
    pollutionNo: body.pollutionNo,
    gstNo: body.gstNo,
    insuranceNo: body.insuranceNo,
    modelName: body.modelName,
    expiryDate: new Date(body.expiryDate),
    yearOfMaking: Number(body.yearOfMaking ?? body.yearMaking),
    status: body.status || 'active',
    vendor: {
      vendorName: body.vendor?.vendorName || body.vendorName,
      mobile: body.vendor?.mobile || body.mobile,
      gender: body.vendor?.gender || body.gender,
      address: body.vendor?.address || body.address,
      aadhar: body.vendor?.aadhar || body.aadhar,
      dob: body.vendor?.dob ? new Date(body.vendor.dob) : new Date(body.dob),
      pan: body.vendor?.pan || body.pan,
      email: body.vendor?.email || body.email,
      vendorProfilePhoto: body.vendor?.vendorProfilePhoto,
      vendorAadharFront: body.vendor?.vendorAadharFront,
      vendorAadharBack: body.vendor?.vendorAadharBack,
      vendorPanImage: body.vendor?.vendorPanImage,
    },
    aadharFront: body.aadharFront,
    aadharBack: body.aadharBack,
    panImage: body.panImage,
    rcImage: body.rcImage,
    insuranceImage: body.insuranceImage,
    pollutionImage: body.pollutionImage,
  };
  
  const vehicle = await Vehicle.create(vehicleData);
  return NextResponse.json(vehicle, { status: 201 });
}

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

  // Required fields validation
  const requiredVendor = ['vendorName', 'mobile', 'gender', 'address', 'aadhar', 'dob', 'pan', 'email'];
  const requiredVehicle = ['cabNumber', 'licenseNo', 'insuranceNo', 'modelName', 'expiryDate', 'yearOfMaking'];

  const missingVendor = requiredVendor.filter(field => !body.vendor?.[field] && !body[field]);
  const missingVehicle = requiredVehicle.filter(field => {
    const value = body[field] ?? body[field === 'licenseNo' ? 'licenceNumber' : field === 'yearOfMaking' ? 'yearMaking' : field];
    return !value;
  });

  if (missingVendor.length > 0 || missingVehicle.length > 0) {
    return NextResponse.json({
      error: 'Missing required fields',
      missing: { vendor: missingVendor, vehicle: missingVehicle }
    }, { status: 400 });
  }

  // Cab number validation
  const cabNumber = body.cabNumber;
  if (!cabNumber || typeof cabNumber !== 'string' || cabNumber.trim() === '') {
    return NextResponse.json({ error: 'Cab number (registration number) is required' }, { status: 400 });
  }

  // Check for existing vehicle with same cabNumber
  const existing = await Vehicle.findOne({ cabNumber });
  if (existing) {
    return NextResponse.json({ error: 'A vehicle with this cab number already exists' }, { status: 409 });
  }

  const licenseNo = body.licenseNo || body.licenceNumber;
  const tacNo = body.tacNo || body.racNo;

  if (licenseNo) {
    const existingLicense = await Vehicle.findOne({ licenseNo });
    if (existingLicense) {
      return NextResponse.json({ error: 'License number already exists' }, { status: 400 });
    }
  }

  // Email and mobile validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const vendorEmail = body.vendor?.email || body.email;
  if (!emailRegex.test(vendorEmail)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  const vendorMobile = body.vendor?.mobile || body.mobile;
  if (!mobileRegex.test(vendorMobile)) {
    return NextResponse.json({ error: 'Invalid mobile number format' }, { status: 400 });
  }

  const vehicleData = {
    cabNumber: cabNumber.trim(),
    tacNo,
    licenseNo,
    pollutionNo: body.pollutionNo,
    gstNo: body.gstNo,
    insuranceNo: body.insuranceNo,
    modelName: body.modelName,
    manufacturingNo: body.manufacturingNo,
    expiryDate: new Date(body.expiryDate),
    yearOfMaking: Number(body.yearOfMaking ?? body.yearMaking),
    status: body.status || 'active',
    vendor: {
      vendorName: body.vendor?.vendorName || body.vendorName,
      mobile: vendorMobile,
      gender: body.vendor?.gender || body.gender,
      address: body.vendor?.address || body.address,
      aadhar: body.vendor?.aadhar || body.aadhar,
      dob: body.vendor?.dob ? new Date(body.vendor.dob) : new Date(body.dob),
      pan: body.vendor?.pan || body.pan,
      email: vendorEmail,
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
    kycDocuments: body.kycDocuments || {}
  };

  try {
    const vehicle = await Vehicle.create(vehicleData);
    return NextResponse.json({
      message: 'Vehicle and vendor created successfully',
      vehicle
    }, { status: 201 });
  } catch (error: any) {
    console.error('Vehicle creation error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate cab number or license number' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
  }
}
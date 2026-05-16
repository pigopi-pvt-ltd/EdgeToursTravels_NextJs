import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = payload.role === 'admin';
    const hasVehiclesModule = payload.role === 'employee' && payload.modules?.includes('vehicles');

    if (!isAdmin && !hasVehiclesModule) {
      return NextResponse.json({ error: 'Forbidden - You need vehicles module access' }, { status: 403 });
    }

    await connectToDatabase();
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = payload.role === 'admin';
    const hasVehiclesModule = payload.role === 'employee' && payload.modules?.includes('vehicles');

    if (!isAdmin && !hasVehiclesModule) {
      return NextResponse.json({ error: 'Forbidden - You need vehicles module access' }, { status: 403 });
    }

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

    const cabNumber = body.cabNumber;
    if (!cabNumber || typeof cabNumber !== 'string' || cabNumber.trim() === '') {
      return NextResponse.json({ error: 'Cab number (registration number) is required' }, { status: 400 });
    }

    const existing = await Vehicle.findOne({ cabNumber });
    if (existing) {
      return NextResponse.json({ error: 'A vehicle with this cab number already exists' }, { status: 409 });
    }

    const licenseNo = body.licenseNo || body.licenceNumber;
    if (licenseNo) {
      const existingLicense = await Vehicle.findOne({ licenseNo });
      if (existingLicense) {
        return NextResponse.json({ error: 'License number already exists' }, { status: 400 });
      }
    }

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
      tacNo: body.tacNo || body.racNo,
      licenseNo,
      pollutionNo: body.pollutionNo,
      gstNo: body.gstNo,
      insuranceNo: body.insuranceNo,
      modelName: body.modelName,
      manufacturingNo: body.manufacturingNo,
      expiryDate: new Date(body.expiryDate),
      yearOfMaking: Number(body.yearOfMaking ?? body.yearMaking),
      status: body.status || 'active',
      capacity: body.capacity ? Number(body.capacity) : 4,
      type: body.type || 'Sedan',
      ac: body.ac !== undefined ? body.ac : true,
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
      kycDocuments: body.kycDocuments || {},
      vehicleImages: body.vehicleImages || []
    };

    const vehicle = await Vehicle.create(vehicleData);
    return NextResponse.json({
      message: 'Vehicle created successfully',
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
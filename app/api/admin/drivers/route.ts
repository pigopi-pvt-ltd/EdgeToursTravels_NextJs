import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const drivers = await User.find({ role: 'driver' }).select('-password');
  return NextResponse.json(drivers);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { fullName, mobile, gender, presentAddress, permanentAddress, alternateMobile,
          aadhar, dob, pan, email, drivingLicense, yearsOfExperience, highestQualification,
          profilePhoto, aadharFront, aadharBack, panImage, licenseImage } = body;

  // Check existing
  const existing = await User.findOne({ $or: [{ email }, { mobileNumber: mobile }] });
  if (existing) return NextResponse.json({ error: 'Email or mobile already exists' }, { status: 400 });

  const hashedPassword = await bcrypt.hash('Driver@123', 10);
  const driver = await User.create({
    email,
    mobileNumber: mobile,
    password: hashedPassword,
    name: fullName,
    role: 'driver',
    profileCompleted: true,
    driverDetails: {
      fullName, mobile, gender, presentAddress, permanentAddress, alternateMobile,
      aadhar, dob: new Date(dob), pan, email, drivingLicense,
      yearsOfExperience: Number(yearsOfExperience), highestQualification,
      profilePhoto, aadharFront, aadharBack, panImage, licenseImage,
      kycStatus: 'pending'
    }
  });

  return NextResponse.json(driver, { status: 201 });
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role'); 
  const filter: any = {};
  if (role && ['admin', 'driver', 'employee', 'customer'].includes(role)) filter.role = role;

  const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { fullName, mobile, gender, presentAddress, permanentAddress, alternateMobile,
          aadhar, dob, pan, email, yearsOfExperience, highestQualification, previousExperience,
          profilePhoto, aadharFront, aadharBack, panImage } = body;

  const existing = await User.findOne({ $or: [{ email }, { mobileNumber: mobile }] });
  if (existing) return NextResponse.json({ error: 'Email or mobile already exists' }, { status: 400 });

  const hashedPassword = await bcrypt.hash('Employee@123', 10);
  const employee = await User.create({
    email,
    mobileNumber: mobile,
    password: hashedPassword,
    name: fullName,
    role: 'employee',
    profileCompleted: true,
    employeeDetails: {
      fullName, mobile, gender, presentAddress, permanentAddress, alternateMobile,
      aadhar, dob: new Date(dob), pan, email,
      yearsOfExperience: Number(yearsOfExperience), highestQualification, previousExperience,
      profilePhoto, aadharFront, aadharBack, panImage
    }
  });

  return NextResponse.json(employee, { status: 201 });
}
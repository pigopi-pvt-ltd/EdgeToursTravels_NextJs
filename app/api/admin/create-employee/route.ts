import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const body = await req.json();
  const { 
    email, 
    mobileNumber, 
    name, 
    role, 
    driverDetails,
    fullName,
    gender,
    presentAddress,
    permanentAddress,
    alternateMobile,
    aadhar,
    dob,
    pan,
    yearsOfExperience,
    highestQualification,
    previousExperience
  } = body;
  
  if (!email || !mobileNumber || !name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  if (!['employee', 'driver'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be employee or driver' }, { status: 400 });
  }
  
  const existing = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (existing) return NextResponse.json({ error: 'Email or mobile number already exists' }, { status: 400 });
  
  const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  let userData: any = {
    email,
    mobileNumber,
    name,
    password: hashedPassword,
    role,
  };
  
  if (role === 'driver') {
    if (!driverDetails) {
      return NextResponse.json({ error: 'Driver details required for driver role' }, { status: 400 });
    }
    userData.driverDetails = driverDetails;
  } else if (role === 'employee') {
    // Validate required employee fields
    if (!fullName || !gender || !presentAddress || !permanentAddress || !aadhar || !dob || !pan || !yearsOfExperience || !highestQualification) {
      return NextResponse.json({ error: 'All employee details are required' }, { status: 400 });
    }
    userData.employeeDetails = {
      fullName,
      mobile: mobileNumber,
      gender,
      presentAddress,
      permanentAddress,
      alternateMobile,
      aadhar,
      dob: new Date(dob),
      pan,
      email,
      yearsOfExperience: Number(yearsOfExperience),
      highestQualification,
      previousExperience
    };
    userData.profileCompleted = true;
  }
  
  const user = await User.create(userData);
  
  return NextResponse.json({ 
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`, 
    userId: user._id, 
    temporaryPassword 
  }, { status: 201 });
}
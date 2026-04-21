import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { IEmployeeDetails } from '@/models/User';

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const body = await req.json();
  const { 
    userId,
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
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  
  // Check for email/mobile conflicts
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }
  
  if (mobileNumber && mobileNumber !== user.mobileNumber) {
    const existingMobile = await User.findOne({ mobileNumber, _id: { $ne: userId } });
    if (existingMobile) return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 });
  }
  
  // Update basic fields
  if (email) user.email = email;
  if (mobileNumber) user.mobileNumber = mobileNumber;
  if (name) user.name = name;
  if (role && ['employee', 'driver'].includes(role)) user.role = role;
  
  // Update role-specific details
  if (role === 'driver' && driverDetails) {
    user.driverDetails = { ...user.driverDetails, ...driverDetails };
  } else if (role === 'employee') {
    const existing = user.employeeDetails || {} as Partial<IEmployeeDetails>;
    
    // Ensure dob is a valid Date (required field)
    let finalDob: Date;
    if (dob) {
      finalDob = new Date(dob);
      if (isNaN(finalDob.getTime())) {
        return NextResponse.json({ error: 'Invalid date of birth' }, { status: 400 });
      }
    } else if (existing.dob) {
      finalDob = existing.dob;
    } else {
      return NextResponse.json({ error: 'Date of birth is required for employee' }, { status: 400 });
    }
    
    // Build employeeDetails object that matches IEmployeeDetails
    const employeeDetails: IEmployeeDetails = {
      fullName: fullName || existing.fullName || '',
      mobile: mobileNumber || existing.mobile || '',
      gender: gender || existing.gender || 'male',
      presentAddress: presentAddress || existing.presentAddress || '',
      permanentAddress: permanentAddress || existing.permanentAddress || '',
      alternateMobile: alternateMobile !== undefined ? alternateMobile : existing.alternateMobile,
      aadhar: aadhar || existing.aadhar || '',
      dob: finalDob,
      pan: pan || existing.pan || '',
      email: email || existing.email || '',
      yearsOfExperience: yearsOfExperience !== undefined ? Number(yearsOfExperience) : (existing.yearsOfExperience ?? 0),
      highestQualification: highestQualification || existing.highestQualification || '',
      previousExperience: previousExperience !== undefined ? previousExperience : existing.previousExperience,
      // Optional image fields
      profilePhoto: existing.profilePhoto,
      aadharFront: existing.aadharFront,
      aadharBack: existing.aadharBack,
      panImage: existing.panImage,
    };
    
    user.employeeDetails = employeeDetails;
    user.profileCompleted = true;
  }
  
  await user.save();
  
  return NextResponse.json({ 
    message: 'User updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      driverDetails: user.driverDetails,
      employeeDetails: user.employeeDetails,
      profileCompleted: user.profileCompleted
    }
  });
}
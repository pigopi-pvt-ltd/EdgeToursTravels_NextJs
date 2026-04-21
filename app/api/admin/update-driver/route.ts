import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { IDriverDetails } from '@/models/User';

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const body = await req.json();
  const {
    driverId,
    email,
    mobileNumber,
    name,
    fullName,
    dateOfBirth,
    drivingLicenseNumber,
    dlExpiryDate,
    vehicleRegNumber,
    vehicleType,
    vehicleMake,
    vehicleModel,
    vehicleYear,
    accountHolderName,
    bankName,
    accountNumber,
    ifscCode,
    kycDocuments,
    presentAddress,
    permanentAddress
  } = body;

  if (!driverId) {
    return NextResponse.json({ error: 'Driver ID is required' }, { status: 400 });
  }

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') {
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
  }

  // Check for email/mobile conflicts with other users
  if (email && email !== driver.email) {
    const existingEmail = await User.findOne({ email, _id: { $ne: driverId } });
    if (existingEmail) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  if (mobileNumber && mobileNumber !== driver.mobileNumber) {
    const existingMobile = await User.findOne({ mobileNumber, _id: { $ne: driverId } });
    if (existingMobile) return NextResponse.json({ error: 'Mobile number already exists' }, { status: 400 });
  }

  // Update basic fields
  if (email) driver.email = email;
  if (mobileNumber) driver.mobileNumber = mobileNumber;
  if (name) driver.name = name;

  // Provide a default object with all required fields to satisfy TypeScript
  const defaultDetails: IDriverDetails = {
    presentAddress: '',
    permanentAddress: '',
    fullName: '',
    dateOfBirth: new Date(),
    drivingLicenseNumber: '',
    dlExpiryDate: new Date(),
    vehicleRegNumber: '',
    vehicleType: 'car',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: undefined,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    kycStatus: 'pending',
    kycDocuments: {},
  };

  const existing = driver.driverDetails || defaultDetails;

  // Update driver details including address fields
  const driverDetails: IDriverDetails = {
    presentAddress: presentAddress !== undefined ? presentAddress : existing.presentAddress,
    permanentAddress: permanentAddress !== undefined ? permanentAddress : existing.permanentAddress,
    fullName: fullName || existing.fullName,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
    drivingLicenseNumber: drivingLicenseNumber || existing.drivingLicenseNumber,
    dlExpiryDate: dlExpiryDate ? new Date(dlExpiryDate) : existing.dlExpiryDate,
    vehicleRegNumber: vehicleRegNumber || existing.vehicleRegNumber,
    vehicleType: vehicleType || existing.vehicleType,
    vehicleMake: vehicleMake !== undefined ? vehicleMake : existing.vehicleMake,
    vehicleModel: vehicleModel !== undefined ? vehicleModel : existing.vehicleModel,
    vehicleYear: vehicleYear !== undefined ? parseInt(vehicleYear.toString()) : existing.vehicleYear,
    accountHolderName: accountHolderName || existing.accountHolderName,
    bankName: bankName || existing.bankName,
    accountNumber: accountNumber || existing.accountNumber,
    ifscCode: ifscCode || existing.ifscCode,
    kycStatus: existing.kycStatus,
    kycDocuments: kycDocuments || existing.kycDocuments || {},
  };

  driver.driverDetails = driverDetails;
  await driver.save();

  return NextResponse.json({
    message: 'Driver updated successfully',
    driver: {
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      mobileNumber: driver.mobileNumber,
      role: driver.role,
      driverDetails: driver.driverDetails
    }
  });
}
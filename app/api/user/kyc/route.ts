import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { IDriverDetails } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user || user.role !== 'driver') {
      return NextResponse.json({ error: 'Not a driver' }, { status: 403 });
    }

    const formData = await request.formData();
    const uploadDir = path.join(process.cwd(), 'public/uploads/kyc', user._id.toString());
    await mkdir(uploadDir, { recursive: true });

    const files = ['aadhaarFront', 'aadhaarBack', 'drivingLicenseImage', 'vehicleRCImage', 'insuranceImage', 'pucImage'];
    const savedPaths: Record<string, string> = {};

    for (const field of files) {
      const file = formData.get(field) as File | null;
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${Date.now()}-${field}.${file.name.split('.').pop()}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        savedPaths[field] = `/uploads/kyc/${user._id}/${fileName}`;
      }
    }

    // Ensure driverDetails exists before modifying
    if (!user.driverDetails) {
      user.driverDetails = {} as IDriverDetails;
    }
    user.driverDetails.kycStatus = 'submitted';
    user.driverDetails.kycDocuments = { ...(user.driverDetails.kycDocuments || {}), ...savedPaths };
    await user.save();

    return NextResponse.json({ success: true, message: 'KYC documents submitted for approval', kycStatus: 'submitted' });
  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
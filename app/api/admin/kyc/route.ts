import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { userId, kycStatus, rejectionReason } = await req.json();
  if (!userId || !kycStatus || !['approved', 'rejected'].includes(kycStatus)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const user = await User.findById(userId);
  if (!user || user.role !== 'driver') {
    return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
  }

  user.driverDetails.kycStatus = kycStatus;
  if (kycStatus === 'rejected' && rejectionReason) {
    user.driverDetails.rejectionReason = rejectionReason;
  }
  await user.save();

  return NextResponse.json({ message: `KYC ${kycStatus}`, kycStatus });
}
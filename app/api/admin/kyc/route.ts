// app/api/admin/kyc/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, kycStatus, rejectionReason } = await request.json();
    if (!userId || !kycStatus) {
      return NextResponse.json({ error: 'Missing userId or kycStatus' }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (!user.driverDetails) user.driverDetails = {};
    user.driverDetails.kycStatus = kycStatus;
    if (kycStatus === 'rejected') {
      user.driverDetails.rejectionReason = rejectionReason || 'Incomplete documents';
    } else {
      delete user.driverDetails.rejectionReason;
    }
    await user.save();

    await sendEmail({
      to: user.email,
      subject: `KYC ${kycStatus.toUpperCase()} – Edge Tours`,
      html: `<h2>Hello ${user.name},</h2><p>Your KYC has been ${kycStatus}.</p>`,
    });

    return NextResponse.json({ success: true, kycStatus });
  } catch (error) {
    console.error('KYC update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
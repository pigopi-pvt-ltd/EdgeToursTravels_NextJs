import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OTP from '@/models/OTP';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber, otp } = await request.json();
    if (!mobileNumber || !otp) {
      return NextResponse.json({ error: 'Mobile number and OTP are required' }, { status: 400 });
    }

    await connectToDatabase();

    const record = await OTP.findOne({ mobileNumber, otp, expiresAt: { $gt: new Date() } });
    if (!record) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // OTP is valid – delete it so it can't be reused
    await OTP.deleteOne({ _id: record._id });

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email || '',  //  fallback to empty string if email is undefined
      role: user.role,
    });

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
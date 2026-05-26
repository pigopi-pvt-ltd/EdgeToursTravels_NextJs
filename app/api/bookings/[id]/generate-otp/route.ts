import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyToken } from '@/lib/jwt';
import { sendSMS } from '@/lib/sms';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const { id } = await params;

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  booking.otp = otp;
  booking.otpExpiry = otpExpiry;
  await booking.save();

  // Send OTP via SMS
  if (booking.contact) {
    await sendSMS(booking.contact, `🚖 Your OTP for trip from ${booking.from} to ${booking.destination} is: ${otp}. Valid for 10 minutes. - Edge Tours`);
  }

  return NextResponse.json({ success: true, otp, message: 'OTP generated successfully' });
}
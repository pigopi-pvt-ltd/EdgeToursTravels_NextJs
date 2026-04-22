import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OTP from '@/models/OTP';
import User from '@/models/User';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { mobileNumber } = await request.json();
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      return NextResponse.json({ error: 'Valid 10‑digit mobile number is required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return NextResponse.json({ error: 'No account found with this mobile number' }, { status: 404 });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ mobileNumber });
    await OTP.create({ mobileNumber, otp });

    console.log(`📱 OTP for ${mobileNumber}: ${otp}`);

    // Optional: send SMS via Twilio (uncomment if you have credentials)
    const twilioClient = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await twilioClient.messages.create({
      body: `Your Edge Tours verification code is: ${otp}`,
      to: mobileNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
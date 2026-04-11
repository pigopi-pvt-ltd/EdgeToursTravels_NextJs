import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { email, mobileNumber, name, role = 'driver', driverDetails } = await request.json();
    if (!email || !mobileNumber) {
      return NextResponse.json({ error: 'Email and mobile number are required' }, { status: 400 });
    }
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 });
    }

    if (role === 'driver') {
      const required = ['fullName', 'dateOfBirth', 'drivingLicenseNumber', 'dlExpiryDate', 'vehicleRegNumber', 'vehicleType'];
      const missing = required.filter(f => !driverDetails?.[f]);
      if (missing.length) {
        return NextResponse.json({ error: `Missing driver fields: ${missing.join(', ')}` }, { status: 400 });
      }
      if (new Date(driverDetails.dlExpiryDate) < new Date()) {
        return NextResponse.json({ error: 'Driving license expired' }, { status: 400 });
      }
    }

    await connectToDatabase();
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobileNumber }] });
    if (existing) {
      const conflict = existing.email === email.toLowerCase() ? 'Email' : 'Mobile number';
      return NextResponse.json({ error: `${conflict} already exists` }, { status: 409 });
    }

    const plainPassword = generateRandomPassword();
    const userData: any = {
      email: email.toLowerCase(),
      mobileNumber,
      password: plainPassword,
      name: name || (role === 'driver' ? driverDetails?.fullName : undefined),
      role,
    };
    if (role === 'driver') {
      userData.driverDetails = { ...driverDetails, kycStatus: 'pending' };
    }

    const user = await User.create(userData);
    await sendEmail({
      to: email,
      subject: `Your ${role === 'driver' ? 'Driver' : 'Admin'} Account – Edge Tours`,
      html: `<h2>Hello ${user.name},</h2><p>Your account as ${role} has been created.</p><p>Email: ${email}</p><p>Temporary password: ${plainPassword}</p><p><a href="${process.env.NEXTAUTH_URL}/login">Login here</a></p>`,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        name: user.name,
        role: user.role,
        driverDetails: role === 'driver' ? user.driverDetails : undefined,
      },
      temporaryPassword: plainPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Admin create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
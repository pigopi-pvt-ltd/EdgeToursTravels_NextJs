import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

// Helper to generate random password
function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { email, mobileNumber, name } = await request.json();

    if (!email || !mobileNumber) {
      return NextResponse.json(
        { error: 'Email and mobile number are required' },
        { status: 400 }
      );
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { mobileNumber }]
    });
    if (existingUser) {
      const conflictField = existingUser.email === email.toLowerCase() ? 'Email' : 'Mobile number';
      return NextResponse.json(
        { error: `${conflictField} already exists` },
        { status: 409 }
      );
    }

    // Generate random password
    const plainPassword = generateRandomPassword();

    // Create employee
    const user = await User.create({
      email: email.toLowerCase(),
      mobileNumber,
      password: plainPassword,
      name,
      role: 'employee',
    });

    // Send email with credentials
    await sendEmail({
      to: email,
      subject: 'Your Employee Account – Edge Tours',
      html: `
        <h2>Hello ${name || 'Employee'},</h2>
        <p>An admin has created an account for you.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${plainPassword}</li>
        </ul>
        <p>Please change your password after logging in.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">Login here</a></p>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id,
          email: user.email,
          mobileNumber: user.mobileNumber,
          name: user.name,
          role: user.role,
        },
        temporaryPassword: plainPassword, // optional, for admin to see
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
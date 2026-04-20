import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, mobileNumber, name, role = 'customer' } = body;

    // Allowed roles for public registration
    if (!['customer', 'driver'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid registration role. Only customer or driver allowed.' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!password || !mobileNumber || !name) {
      return NextResponse.json(
        { error: 'Name, mobile number, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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

    // For customer, email is mandatory
    if (role === 'customer' && (!email || !email.includes('@'))) {
      return NextResponse.json(
        { error: 'Valid email is required for user registration' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check existing user by mobile number (unique)
    const existingMobile = await User.findOne({ mobileNumber });
    if (existingMobile) {
      return NextResponse.json(
        { error: 'Mobile number already registered' },
        { status: 409 }
      );
    }

    // Check email uniqueness if provided
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare user data
    const userData: any = {
      mobileNumber,
      password,
      name,
      role,
      profileCompleted: true,
    };
    if (email) {
      userData.email = email.toLowerCase();
    }

    const user = await User.create(userData);

    // Send welcome email only if email exists
    if (user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: `Welcome to Edge Tours – ${role === 'driver' ? 'Driver' : 'Customer'} Account Created`,
          html: `
            <h2>Welcome ${name}!</h2>
            <p>Your account has been created successfully.</p>
            <p><strong>Login Credentials:</strong></p>
            <ul>
              <li>${user.email ? `Email: ${user.email}` : `Mobile: ${mobileNumber}`}</li>
              <li>Password: ${password}</li>
            </ul>
            <p>Please change your password after logging in for security.</p>
            <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">Click here to login</a></p>
          `,
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError);
        // Don't block registration
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email || undefined,
      role: user.role,
    });

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email || null,
          mobileNumber: user.mobileNumber,
          name: user.name,
          role: user.role,
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    // Send detailed error for debugging (remove in production)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
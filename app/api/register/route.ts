import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, mobileNumber, name } = await request.json();

    if (!email || !password || !mobileNumber) {
      return NextResponse.json(
        { error: 'Email, password, and mobile number are required' },
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

    await connectToDatabase();

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

    // Always create employee (role defaults to 'employee')
    const user = await User.create({
      email: email.toLowerCase(),
      mobileNumber,
      password,
      name,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          mobileNumber: user.mobileNumber,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, mobileNumber, password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!email && !mobileNumber) {
      return NextResponse.json(
        { error: 'Email or mobile number is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by either email or mobile number
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
          profileCompleted: user.profileCompleted,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
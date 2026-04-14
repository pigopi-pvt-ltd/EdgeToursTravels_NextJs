import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, password, mobileNumber, name, 
      role = 'customer', 
      driverDetails, 
      employeeDetails 
    } = body;

    // Validate required fields
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

    // Role must be valid
    const validRoles = ['admin', 'driver', 'employee', 'customer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // If role is driver, driverDetails must be provided
    if (role === 'driver' && !driverDetails) {
      return NextResponse.json({ error: 'Driver details are required' }, { status: 400 });
    }
    // If role is employee, employeeDetails must be provided
    if (role === 'employee' && !employeeDetails) {
      return NextResponse.json({ error: 'Employee details are required' }, { status: 400 });
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

    // Prepare user data
    const userData: any = {
      email: email.toLowerCase(),
      mobileNumber,
      password,
      name,
      role,
      profileCompleted: true, // since we're providing all details
    };

    if (role === 'driver') {
      userData.driverDetails = driverDetails;
    } else if (role === 'employee') {
      userData.employeeDetails = employeeDetails;
    }

    const user = await User.create(userData);

    // Send welcome email with credentials
    await sendEmail({
      to: email,
      subject: 'Welcome to Edge Tours – Your Account Details',
      html: `
        <h2>Welcome ${name || (role === 'driver' ? 'Driver' : 'Employee')}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Login Credentials:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>Please change your password after logging in for security.</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login">Click here to login</a></p>
      `,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

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
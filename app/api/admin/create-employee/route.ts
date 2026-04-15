import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const body = await req.json();
  const { email, mobileNumber, name, role, driverDetails, employeeDetails } = body;

  // Validate required common fields
  if (!email || !mobileNumber || !name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!['admin', 'driver', 'employee', 'customer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // Check uniqueness
  const existing = await User.findOne({ $or: [{ email }, { mobileNumber }] });
  if (existing) return NextResponse.json({ error: 'Email or mobile already exists' }, { status: 400 });

  // Generate temporary password
  const temporaryPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

  const userData: any = {
    email,
    mobileNumber,
    name,
    password: hashedPassword,
    role,
    profileCompleted: role === 'customer' ? true : false, // customers are created via frontend booking form
  };

  // Add role-specific details if provided
  if (role === 'driver' && driverDetails) {
    userData.driverDetails = {
      ...driverDetails,
      kycStatus: 'pending',
    };
  } else if (role === 'employee' && employeeDetails) {
    userData.employeeDetails = employeeDetails;
  }

  const user = await User.create(userData);

  // Send welcome email with credentials
  const loginUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/login`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Edge Tours & Travels</h2>
      <p>Dear ${name},</p>
      <p>Your account has been created as <strong>${role}</strong>.</p>
      <p><strong>Login Credentials:</strong></p>
      <ul>
        <li>Email: ${email}</li>
        <li>Mobile: ${mobileNumber}</li>
        <li>Temporary Password: <code style="background:#f4f4f4; padding:2px 6px;">${temporaryPassword}</code></li>
      </ul>
      <p>Please login at: <a href="${loginUrl}">${loginUrl}</a></p>
      <p>For security, change your password after first login.</p>
      <hr />
      <p style="font-size:12px; color:#666;">Edge Tours & Travels</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Welcome to Edge Tours - Your ${role} account`,
    html: emailHtml,
    text: `Welcome ${name}!\n\nYour account (${role}) has been created.\nLogin: ${email} / ${mobileNumber}\nTemporary Password: ${temporaryPassword}\nLogin URL: ${loginUrl}`,
  });

  // Optionally send SMS (if you have SMS service integration)
  // await sendSMS(mobileNumber, `Edge Tours: Your temporary password is ${temporaryPassword}`);

  return NextResponse.json(
    {
      message: 'User created successfully',
      userId: user._id,
      temporaryPassword,
      role: user.role,
    },
    { status: 201 }
  );
}
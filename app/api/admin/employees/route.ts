import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

function generateRandomPassword(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper to parse DD/MM/YYYY or YYYY-MM-DD to Date
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Try ISO format first (YYYY-MM-DD)
  let parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }
  // Try DD/MM/YYYY
  parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }
  // Try generic
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  return null;
}

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const employees = await User.find({ role: 'employee' }).select('-password').sort({ createdAt: -1 });
  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const body = await req.json();
  const {
    fullName,
    mobile,
    email,
    gender,
    presentAddress,
    permanentAddress,
    alternateMobile,
    aadhar,
    dob,
    pan,
    yearsOfExperience,
    highestQualification,
    previousExperience,
  } = body;

  // Validation
  if (!fullName || !mobile || !email) {
    return NextResponse.json({ error: 'Full name, mobile, and email are required' }, { status: 400 });
  }

  // Check existing user
  const existing = await User.findOne({ $or: [{ email }, { mobileNumber: mobile }] });
  if (existing) {
    return NextResponse.json({ error: 'Email or mobile already exists' }, { status: 400 });
  }

  // Parse date of birth
  let dobDate: Date | null = null;
  if (dob) {
    dobDate = parseDate(dob);
    if (!dobDate) {
      return NextResponse.json({ error: 'Invalid date format for date of birth. Use DD/MM/YYYY or YYYY-MM-DD.' }, { status: 400 });
    }
  } else {
    dobDate = new Date(); // fallback – but you might want to require it
  }

  const tempPassword = generateRandomPassword(8);

  const userData = {
    name: fullName,
    email,
    mobileNumber: mobile,
    password: tempPassword,
    role: 'employee',
    profileCompleted: true,
    employeeDetails: {
      fullName: fullName || '',
      mobile: mobile || '',
      gender: gender || 'male',
      presentAddress: presentAddress || '',
      permanentAddress: permanentAddress || '',
      alternateMobile: alternateMobile || '',
      aadhar: aadhar || '',
      dob: dobDate,
      pan: pan || '',
      email: email || '',
      yearsOfExperience: Number(yearsOfExperience) || 0,
      highestQualification: highestQualification || '',
      previousExperience: previousExperience || '',
    },
  };

  try {
    const user = await User.create(userData);
    console.log('User created:', user._id);

    // Send email
    const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/login`;
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Edge Tours – Employee Account',
        html: `
          <h2>Welcome ${fullName}!</h2>
          <p>Your employee account has been created.</p>
          <p><strong>Login Credentials:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Password: <strong>${tempPassword}</strong></li>
          </ul>
          <p><a href="${loginUrl}">Click here to login</a></p>
          <p>Please change your password after first login.</p>
        `,
      });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(
      {
        message: 'Employee created successfully',
        employee: userWithoutPassword,
        temporaryPassword: tempPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Employee creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  let parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }
  parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime())) return date;
  }
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin' && admin.role !== 'employee') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  
  try {
    const user = await User.findById(id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
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

  let dobDate: Date | undefined;
  if (dob) {
    const parsed = parseDate(dob);
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid date format for date of birth' }, { status: 400 });
    }
    dobDate = parsed;
  }

  const updateData = {
    name: fullName,
    email,
    mobileNumber: mobile,
    employeeDetails: {
      fullName,
      mobile,
      gender: gender || 'male',
      presentAddress: presentAddress || '',
      permanentAddress: permanentAddress || '',
      alternateMobile: alternateMobile || '',
      aadhar: aadhar || '',
      dob: dobDate,
      pan: pan || '',
      email,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      highestQualification: highestQualification || '',
      previousExperience: previousExperience || '',
    },
  };

  const updated = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
  if (!updated) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  return NextResponse.json({ message: 'Employee deleted successfully' });
}
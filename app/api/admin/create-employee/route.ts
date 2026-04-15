import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const body = await req.json();
  const { email, mobileNumber, name, role, driverDetails } = body;
  
  if (!email || !mobileNumber || !name || role !== 'driver') {
    return NextResponse.json({ error: 'Missing required fields or invalid role' }, { status: 400 });
  }
  
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  
  const temporaryPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
  
  const user = await User.create({
    email,
    mobileNumber,
    name,
    password: hashedPassword,
    role: 'driver',
    driverDetails: driverDetails || {},
  });
  
  return NextResponse.json({ message: 'Driver created', userId: user._id, temporaryPassword }, { status: 201 });
}
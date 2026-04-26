import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  if (payload.role !== 'employee') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const user = await User.findById(payload.userId).select('employeeDetails');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user.employeeDetails || {});
}

export async function PUT(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  if (payload.role !== 'employee') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const updates = await req.json();
  const user = await User.findById(payload.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  user.employeeDetails = { ...(user.employeeDetails || {}), ...updates };
  await user.save();

  return NextResponse.json({ success: true, employeeDetails: user.employeeDetails });
}
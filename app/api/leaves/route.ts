import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Leave from '@/models/Leave';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';


// Fetch leaves (employees get their own, admin gets all)
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let query: any = {};
  if (payload.role === 'employee') {
    query.employeeId = payload.userId;
  }
  if (status && status !== 'all') {
    query.status = status;
  }

  const leaves = await Leave.find(query).sort({ createdAt: -1 });
  return NextResponse.json(leaves);
}

// Employee submits leave request
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'employee') {
    return NextResponse.json({ error: 'Only employees can submit leave' }, { status: 403 });
  }

  await connectToDatabase();
  const body = await req.json();
  const { startDate, endDate, type, reason } = body;

  if (!startDate || !endDate || !type || !reason) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Fetch user details from database to get name and email
  const user = await User.findById(payload.userId).select('name email');
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const leave = await Leave.create({
    employeeId: payload.userId,
    employeeName: user.name || 'Employee',
    employeeEmail: user.email || '',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    type,
    reason,
    status: 'pending',
  });

  return NextResponse.json(leave, { status: 201 });
}
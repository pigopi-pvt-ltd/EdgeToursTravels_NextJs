import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectToDatabase from '@/lib/mongodb';
import Salary from '@/models/Salary';
import User from '@/models/User';

async function checkAdmin(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const filter: any = {};
  if (userId) filter.userId = userId;
  if (month) filter.month = month;
  if (year && !isNaN(parseInt(year))) filter.year = parseInt(year);

  const salaries = await Salary.find(filter).populate('userId', 'name email mobileNumber').lean();
  return NextResponse.json(salaries);
}

export async function POST(req: NextRequest) {
  const admin = await checkAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { userId, month, year, earnings, deductions, netPayable, employeeName } = body;

  if (!userId || !month || !year || !earnings || !deductions || netPayable === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user || user.role !== 'employee') {
    return NextResponse.json({ error: 'Invalid employee' }, { status: 400 });
  }

  const nameToStore = employeeName || user.name || 'Employee';

  const updated = await Salary.findOneAndUpdate(
    { userId, month, year },
    { userId, month, year, earnings, deductions, netPayable, employeeName: nameToStore },
    { upsert: true, new: true }
  );

  return NextResponse.json(updated);
}
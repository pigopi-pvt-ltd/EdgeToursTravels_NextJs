import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (!employeeId || !month || !year) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  await connectToDatabase();
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);
  const records = await Attendance.find({
    userId: employeeId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  return NextResponse.json(records);
}
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { action } = await req.json(); // 'checkin' or 'checkout'
  await connectToDatabase();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await Attendance.findOne({ userId: payload.userId, date: today });

  if (action === 'checkin') {
    if (existing && existing.checkIn) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }
    const attendance = await Attendance.create({
      userId: payload.userId,
      date: today,
      checkIn: new Date(),
      status: 'present',
    });
    return NextResponse.json({ message: 'Checked in', attendance });
  }

  if (action === 'checkout') {
    if (!existing || !existing.checkIn) {
      return NextResponse.json({ error: 'Not checked in today' }, { status: 400 });
    }
    existing.checkOut = new Date();
    await existing.save();
    return NextResponse.json({ message: 'Checked out', attendance: existing });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  let filter: any = { userId: payload.userId };
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    filter.date = { $gte: start, $lt: end };
  }

  const records = await Attendance.find(filter).sort({ date: -1 });
  return NextResponse.json(records);
}
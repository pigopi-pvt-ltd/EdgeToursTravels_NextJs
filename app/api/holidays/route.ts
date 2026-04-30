import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Holiday from '@/models/Holiday';
import { verifyToken } from '@/lib/jwt';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = await Holiday.find({ date: { $gte: today } }).sort({ date: 1 });
  return NextResponse.json(upcoming);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const body = await req.json();
  const { name, date, type } = body;

  if (!name || !date) {
    return NextResponse.json({ error: 'Name and date are required' }, { status: 400 });
  }

  const holiday = await Holiday.create({
    name,
    date: new Date(date),
    type: type || 'public',
  });

  return NextResponse.json(holiday, { status: 201 });
}
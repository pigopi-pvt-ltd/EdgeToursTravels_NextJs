import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Holiday from '@/models/Holiday';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const today = new Date();
  const upcoming = await Holiday.find({ date: { $gte: today } }).sort({ date: 1 });
  return NextResponse.json(upcoming);
}

// Admin-only POST (optional)
export async function POST(req: NextRequest) {
  // ... only admin can add holidays
}
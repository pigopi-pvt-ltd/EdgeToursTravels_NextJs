import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/jwt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function verifyAdmin(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  await connectToDatabase();
  const user = await User.findById(payload.userId);
  if (!user || user.role !== 'admin') return null;
  return payload;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
}
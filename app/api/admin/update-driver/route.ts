import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();
  
  await connectToDatabase();
  const body = await req.json();
  const { userId, driverDetails } = body;
  
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  
  const user = await User.findById(userId);
  if (!user || user.role !== 'driver') return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
  
  // Merge driverDetails
  user.driverDetails = { ...user.driverDetails, ...driverDetails };
  await user.save();
  
  return NextResponse.json({ message: 'Driver updated' });
}
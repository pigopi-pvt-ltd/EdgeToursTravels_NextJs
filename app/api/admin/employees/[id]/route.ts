import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const user = await User.findById(id).select('-password');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  let bookings = [];
  if (user.role === 'customer') {
    bookings = await Booking.find({ userId: id }).sort({ dateTime: -1 });
  } else if (user.role === 'driver') {
    bookings = await Booking.find({ driverId: id }).sort({ dateTime: -1 });
  }

  return NextResponse.json({ user, bookings });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const body = await req.json();
  const allowedUpdates = ['name', 'mobileNumber', 'role', 'driverDetails', 'employeeDetails', 'profileCompleted'];
  const updateFields: any = {};
  for (const key of allowedUpdates) {
    if (body[key] !== undefined) updateFields[key] = body[key];
  }
  // Prevent changing role to invalid
  if (updateFields.role && !['admin', 'driver', 'employee', 'customer'].includes(updateFields.role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ message: 'User deleted successfully' });
}
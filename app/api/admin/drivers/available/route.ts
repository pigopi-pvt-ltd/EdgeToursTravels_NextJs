
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Booking from '@/models/Booking';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  
  // Get all drivers
  const drivers = await User.find({ role: 'driver' }).select('-password');
  
  // Get all drivers who are currently on active trips (not completed)
  const activeTrips = await Booking.find({
    status: { $in: ['confirmed', 'in-progress'] },
    tripCompleted: { $ne: true }
  }).select('driverId');
  
  const activeDriverIds = new Set(activeTrips.map(trip => trip.driverId?.toString()));
  
  // Also get drivers who have accepted pending trips
  const pendingTrips = await Booking.find({
    status: 'pending',
    driverId: { $ne: null },
    driverResponse: 'accepted'
  }).select('driverId');
  
  const pendingDriverIds = new Set(pendingTrips.map(trip => trip.driverId?.toString()));
  
  // Combine all unavailable driver IDs
  const unavailableDriverIds = new Set([...activeDriverIds, ...pendingDriverIds]);
  
  // Filter only available drivers
  const availableDrivers = drivers.filter(driver => 
    !unavailableDriverIds.has(driver._id.toString())
  );
  
  return NextResponse.json(availableDrivers);
}

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import Booking from '@/models/Booking';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  
  // Get all vehicles currently on active trips
  const activeTrips = await Booking.find({
    status: { $in: ['confirmed', 'in-progress'] },
    tripCompleted: { $ne: true }
  }).select('vehicleId');
  
  const activeVehicleIds = new Set(activeTrips.map(trip => trip.vehicleId?.toString()).filter(Boolean));
  
  // Get vehicles on pending trips
  const pendingTrips = await Booking.find({
    status: 'pending',
    vehicleId: { $ne: null }
  }).select('vehicleId');
  
  const pendingVehicleIds = new Set(pendingTrips.map(trip => trip.vehicleId?.toString()).filter(Boolean));
  
  const unavailableVehicleIds = new Set([...activeVehicleIds, ...pendingVehicleIds]);
  
  // Get available vehicles
  const vehicles = await Vehicle.find({ status: 'active' });
  
  const availableVehicles = vehicles.filter(vehicle => 
    !unavailableVehicleIds.has(vehicle._id.toString())
  );
  
  return NextResponse.json(availableVehicles);
}
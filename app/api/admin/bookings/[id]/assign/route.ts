import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  await connectToDatabase();
  const { id } = await params;
  const { driverId, vehicleId } = await req.json();

  if (!driverId) return NextResponse.json({ error: 'Driver ID required' }, { status: 400 });

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') return NextResponse.json({ error: 'Invalid driver' }, { status: 400 });

  let vehicle = null;
  if (vehicleId) {
    vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ error: 'Invalid vehicle' }, { status: 400 });
    booking.vehicleId = vehicleId;
  }

  booking.driverId = driverId;
  booking.status = 'pending';
  await booking.save();

  // Notify driver
  await Notification.create({
    userId: driverId,
    bookingId: booking._id,
    title: 'New Trip Assignment',
    message: `You have been assigned a trip from ${booking.from} to ${booking.destination} on ${new Date(booking.dateTime).toLocaleString()}. Vehicle: ${vehicle ? vehicle.cabNumber : 'Not specified'}. Please accept or reject.`,
    type: 'driver_assigned',
    metadata: { bookingFrom: booking.from, bookingTo: booking.destination, vehicleId },
  });

  // Notify customer if exists
  if (booking.userId) {
    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Driver and Vehicle Assigned',
      message: `A driver and vehicle (${vehicle ? vehicle.cabNumber : 'TBD'}) have been assigned to your trip.`,
      type: 'driver_assigned',
    });
  }

  return NextResponse.json({ message: 'Driver and vehicle assigned successfully', booking });
}
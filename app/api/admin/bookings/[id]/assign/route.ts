
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { sendNotification } from '@/lib/notifications';
import { sendSMS } from '@/lib/sms';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.status === 'OK' && data.results[0]) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch {
    return null;
  }
}

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

  // Get coordinates for pickup and dropoff
  const fromCoords = await geocodeAddress(booking.from);
  const toCoords = await geocodeAddress(booking.destination);
  
  if (fromCoords) booking.fromCoordinates = fromCoords;
  if (toCoords) booking.toCoordinates = toCoords;

  // Check driver availability
  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') return NextResponse.json({ error: 'Invalid driver' }, { status: 400 });

  const activeDriverTrip = await Booking.findOne({
    driverId: driverId,
    status: { $in: ['confirmed', 'in-progress'] },
    tripCompleted: { $ne: true }
  });

  if (activeDriverTrip) {
    return NextResponse.json({ error: 'Driver is currently on an active trip' }, { status: 400 });
  }

  // Handle vehicle
  let vehicle = null;
  if (vehicleId) {
    vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ error: 'Invalid vehicle' }, { status: 400 });
    if (!vehicle.isAvailable) {
      return NextResponse.json({ error: 'Vehicle is not available' }, { status: 400 });
    }
    vehicle.isAvailable = false;
    vehicle.currentBookingId = booking._id;
    vehicle.currentDriverId = driverId;
    await vehicle.save();
    booking.vehicleId = vehicleId;
  }

  // Mark driver as unavailable
  await User.findByIdAndUpdate(driverId, {
    'driverDetails.availabilityStatus': 'unavailable'
  });

  // Generate OTP
  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  booking.driverId = driverId;
  booking.status = 'pending';
  booking.driverResponse = null;
  booking.otp = otp;
  booking.otpExpiry = otpExpiry;
  await booking.save();

  // Send OTP via SMS
  if (booking.contact) {
    await sendSMS(booking.contact, `🚖 Your OTP for trip from ${booking.from} to ${booking.destination} is: ${otp}. Valid for 10 minutes. - Edge Tours`);
  }

  // Notifications
  await sendNotification({
    userId: driverId.toString(),
    bookingId: booking._id.toString(),
    type: 'driver_assigned',
    title: 'New Trip Assignment',
    message: `You have been assigned a trip from ${booking.from} to ${booking.destination}. OTP: ${otp}`,
    metadata: { bookingFrom: booking.from, bookingTo: booking.destination, otp },
  });

  if (booking.userId) {
    await sendNotification({
      userId: booking.userId.toString(),
      bookingId: booking._id.toString(),
      type: 'driver_assigned',
      title: 'Driver Assigned',
      message: `A driver has been assigned to your trip. OTP: ${otp}`,
      metadata: { driverName: driver.name, otp },
    });
  }

  return NextResponse.json({ message: 'Driver assigned successfully', booking, otp });
}
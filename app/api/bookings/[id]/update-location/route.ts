
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { verifyToken } from '@/lib/jwt';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  await connectToDatabase();
  const { id } = await params;
  const { location } = await req.json();

  if (!location || !location.lat || !location.lng) {
    return NextResponse.json({ error: 'Invalid location data' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not your trip' }, { status: 403 });
  }

  // Update current location
  booking.currentLocation = {
    lat: location.lat,
    lng: location.lng,
    address: location.address || '',
    updatedAt: new Date(),
  };

  // Add to route path history
  if (!booking.routePath) booking.routePath = [];
  booking.routePath.push({
    lat: location.lat,
    lng: location.lng,
    timestamp: new Date(),
  });

  // Calculate distance traveled (simplified)
  if (booking.routePath.length > 1) {
    const lastPoint = booking.routePath[booking.routePath.length - 2];
    const distance = calculateDistance(
      lastPoint.lat, lastPoint.lng,
      location.lat, location.lng
    );
    booking.distanceTraveled = (booking.distanceTraveled || 0) + distance;
  }

  await booking.save();

  return NextResponse.json({ success: true });
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
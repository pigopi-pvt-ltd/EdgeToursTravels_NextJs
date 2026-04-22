import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendSMS } from '@/lib/sms';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'driver') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const { id } = await params;
  const { response } = await req.json(); // 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(response)) {
    return NextResponse.json({ error: 'Invalid response' }, { status: 400 });
  }

  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  if (booking.driverId?.toString() !== payload.userId) {
    return NextResponse.json({ error: 'Not your assigned trip' }, { status: 403 });
  }

  const driver = await User.findById(payload.userId);
  const driverName = driver?.name || 'Driver';

  booking.driverResponse = response;
  if (response === 'accepted') {
    booking.status = 'confirmed';
  } else {
    booking.status = 'pending'; // admin can reassign
  }
  await booking.save();

  // Notify customer via in-app notification and SMS
  if (booking.userId) {
    const customer = await User.findById(booking.userId);
    const customerMobile = customer?.mobileNumber || booking.contact; // fallback to booking contact
    
    await Notification.create({
      userId: booking.userId,
      bookingId: booking._id,
      title: response === 'accepted' ? 'Trip Accepted' : 'Trip Rejected',
      message: response === 'accepted'
        ? `Your trip from ${booking.from} to ${booking.destination} has been accepted by driver ${driverName}.`
        : `The driver has rejected your trip from ${booking.from} to ${booking.destination}. Admin will assign another driver.`,
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
    });

    // Send SMS only when accepted and customer has mobile number
    if (response === 'accepted' && customerMobile) {
      const dateStr = new Date(booking.dateTime).toLocaleString();
      const message = `🚖 Edge Tours: Your trip from ${booking.from} to ${booking.destination} on ${dateStr} has been ACCEPTED by driver ${driverName}. We will notify you when the driver arrives. Thank you!`;
      await sendSMS(customerMobile, message);
    }
  }

  // Notify admin
  const adminUser = await User.findOne({ role: 'admin' });
  if (adminUser) {
    await Notification.create({
      userId: adminUser._id,
      bookingId: booking._id,
      title: response === 'accepted' ? 'Trip Accepted by Driver' : 'Trip Rejected by Driver',
      message: `Driver ${payload.userId} has ${response} trip #${booking._id}.`,
      type: response === 'accepted' ? 'trip_accepted' : 'trip_rejected',
    });
  }

  return NextResponse.json({ message: `Trip ${response}`, booking });
}
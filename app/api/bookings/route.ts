import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  let filter = {};
  
  if (payload.role === 'admin' || payload.role === 'employee') {
    filter = {};
  } 
  else if (payload.role === 'driver') {
    filter = { driverId: payload.userId };
  } 
  else if (payload.role === 'customer') {
    const user = await User.findById(payload.userId).select('mobileNumber');
    if (user && user.mobileNumber) {
      filter = {
        $or: [
          { userId: payload.userId },
          { contact: user.mobileNumber }
        ]
      };
    } else {
      filter = { userId: payload.userId };
    }
  } 
  else {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const bookings = await Booking.find(filter)
      .populate('driverId', 'name email mobileNumber')
      .populate('userId', 'name email')
      .populate('vehicleId', 'cabNumber modelName')
      .sort({ dateTime: -1 });
    return NextResponse.json(bookings);
  } catch (err: any) {
    console.error('Booking fetch error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, destination, dateTime, name, contact, userId, price } = body;

    if (!from || !destination || !dateTime || !name || !contact) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectToDatabase();
    const newBooking = await Booking.create({
      from,
      destination,
      dateTime: new Date(dateTime),
      name,
      contact,
      price,
      status: 'pending',
      userId: userId || null,
    });

    if (userId) {
      await sendNotification({
        userId: userId.toString(),
        bookingId: newBooking._id.toString(),
        type: 'booking_created',
        title: 'Booking Created',
        message: `Your trip from ${from} to ${destination} has been created and is pending assignment.`,
        metadata: { from, destination, dateTime },
      });
    }

    return NextResponse.json({ message: 'Booking created', booking: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'employee')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, status, driverId, vehicleId } = await req.json();
  if (!id) return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });

  await connectToDatabase();
  const updateData: any = {};
  let oldBooking = null;
  
  if (status) {
    oldBooking = await Booking.findById(id);
    updateData.status = status;
  }
  if (driverId) updateData.driverId = driverId;
  if (vehicleId) updateData.vehicleId = vehicleId;

  const updatedBooking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
  if (!updatedBooking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  // Send notification on status change
  if (status && oldBooking && oldBooking.status !== status && updatedBooking.userId) {
    let notificationType = 'booking_created';
    let title = 'Booking Updated';
    let message = `Your booking status has been updated to ${status}.`;
    
    if (status === 'confirmed') {
      notificationType = 'trip_accepted';
      title = 'Booking Confirmed';
      message = `Your trip from ${updatedBooking.from} to ${updatedBooking.destination} has been confirmed.`;
    } else if (status === 'completed') {
      notificationType = 'trip_completed';
      title = 'Trip Completed';
      message = `Your trip has been marked as completed. Thank you for riding with us!`;
    } else if (status === 'cancelled') {
      notificationType = 'trip_cancelled';
      title = 'Trip Cancelled';
      message = `Your trip has been cancelled. Please contact support if you have any questions.`;
    }
    
    await sendNotification({
      userId: updatedBooking.userId.toString(),
      bookingId: updatedBooking._id.toString(),
      type: notificationType as any,
      title,
      message,
      metadata: { oldStatus: oldBooking.status, newStatus: status },
    });
  }

  return NextResponse.json(updatedBooking);
}
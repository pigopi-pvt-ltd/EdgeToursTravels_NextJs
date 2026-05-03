import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import LongTermRental from '@/models/LongTermRental';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';
import { sendNotification } from '@/lib/notifications';
import { sendEmail } from '@/lib/email';

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

  const rental = await LongTermRental.findById(id);
  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 });

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') {
    return NextResponse.json({ error: 'Invalid driver' }, { status: 400 });
  }

  let vehicle = null;
  if (vehicleId) {
    vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return NextResponse.json({ error: 'Invalid vehicle' }, { status: 400 });
    rental.vehicleId = vehicleId;
  }

  rental.driverId = driverId;
  rental.status = 'assigned';
  await rental.save();

  // Notify driver 
  await sendNotification({
    userId: driverId.toString(),
    bookingId: rental._id.toString(),
    type: 'driver_assigned',
    title: 'New Rental Assignment',
    message: `You have been assigned a rental from ${rental.from} to ${rental.destination}.`,
    metadata: { rentalId: rental._id.toString() },
  });

  // Notify customer
  const customer = await User.findById(rental.userId);
  if (customer) {
    await sendNotification({
      userId: customer._id.toString(),
      bookingId: rental._id.toString(),
      type: 'driver_assigned',
      title: 'Driver Assigned',
      message: `A driver has been assigned to your rental request.`,
    });
  }

  //  send email to customer
  if (customer?.email && process.env.EMAIL_ENABLED === 'true') {
    await sendEmail({
      to: customer.email,
      subject: 'Driver Assigned to Your Rental Request',
      html: `<p>Dear ${rental.name},</p><p>A driver (${driver.name}) and vehicle (${vehicle?.cabNumber || 'to be assigned'}) have been assigned to your rental request from ${rental.from} to ${rental.destination}.</p><p>Thank you for choosing Edge Tours.</p>`,
    });
  }

  return NextResponse.json({ message: 'Assigned successfully', rental });
}
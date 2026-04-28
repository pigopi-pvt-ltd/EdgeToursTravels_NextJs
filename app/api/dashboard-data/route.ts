import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import User from '@/models/User';
import Vehicle from '@/models/Vehicle';
import Booking from '@/models/Booking';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectToDatabase();

    const [employees, drivers, vehicles, bookings] = await Promise.all([
      User.find({ role: 'employee' }).select('name role email mobileNumber').lean(),
      User.find({ role: 'driver' }).select('name').lean(),
      Vehicle.find({}).lean(),
      Booking.find({})
        .populate('driverId', 'name')
        .populate('vehicleId', 'cabNumber')
        .lean()
    ]);

    const revenue = bookings.reduce((sum, b) => {
      const price = typeof b.price === 'number' ? b.price : parseFloat(b.price as string || '0');
      if ((b.status === 'confirmed' || b.status === 'completed') && !isNaN(price)) {
        return sum + price;
      }
      return sum;
    }, 0);

    const dailyMap = new Map<string, number>();
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, 0);
    }
    bookings.forEach(b => {
      const dateStr = new Date(b.dateTime).toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, dailyMap.get(dateStr)! + 1);
      }
    });
    const dailyBookings = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));

    const statusCounts = [
      { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
      { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
      { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
      { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length }
    ].filter(s => s.value > 0);

    return NextResponse.json({
      employees: employees.map(e => ({ _id: e._id, name: e.name, role: e.role, email: e.email, mobileNumber: e.mobileNumber })),
      drivers,
      vehicles,
      bookings: bookings.map(b => ({ ...b, driverId: b.driverId || null, vehicleId: b.vehicleId || null })),
      revenue,
      dailyBookings,
      statusCounts
    });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
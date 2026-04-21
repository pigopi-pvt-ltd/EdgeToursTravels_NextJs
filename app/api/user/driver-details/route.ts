import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/jwt';
import { IDriverDetails } from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(payload.userId).select('driverDetails role');
    if (!user || user.role !== 'driver') {
      return NextResponse.json({ error: 'Not a driver' }, { status: 403 });
    }

    return NextResponse.json(user.driverDetails || {});
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user || user.role !== 'driver') {
      return NextResponse.json({ error: 'Not a driver' }, { status: 403 });
    }

    const updates = await request.json();
    console.log('Received updates:', updates);

    // Ensure driverDetails exists
    if (!user.driverDetails) {
      user.driverDetails = {} as IDriverDetails;
    }

    // Start with existing data
    const merged = { ...user.driverDetails };

    // Apply updates
    Object.assign(merged, updates);

    // Ensure address fields have defaults (if not provided in updates)
    if (!merged.presentAddress) merged.presentAddress = '';
    if (!merged.permanentAddress) merged.permanentAddress = '';

    // Convert date strings to Date objects
    if (merged.dateOfBirth && typeof merged.dateOfBirth === 'string') {
      merged.dateOfBirth = new Date(merged.dateOfBirth);
    }
    if (merged.dlExpiryDate && typeof merged.dlExpiryDate === 'string') {
      merged.dlExpiryDate = new Date(merged.dlExpiryDate);
    }

    user.driverDetails = merged;
    await user.save();

    return NextResponse.json({ success: true, driverDetails: user.driverDetails });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Internal error: ' + (error as Error).message }, { status: 500 });
  }
}
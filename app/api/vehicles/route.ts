import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';

export async function GET() {
  try {
    await connectToDatabase();
    // Return all vehicles, or filter only available ones
    const vehicles = await Vehicle.find({ status: 'active' }).sort({ createdAt: -1 });
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return NextResponse.json({ error: 'Failed to load vehicles' }, { status: 500 });
  }
}
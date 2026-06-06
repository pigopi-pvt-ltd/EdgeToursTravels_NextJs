import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Location from '@/models/Location';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const location = await Location.findById(id);
    if (!location) return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    return NextResponse.json(location);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    
    const updated = await Location.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  try {
    await connectToDatabase();
    const { id } = await params;
    
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}

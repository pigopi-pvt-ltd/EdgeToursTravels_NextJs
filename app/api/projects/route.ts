import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId');
    
    const query = locationId ? { locationId } : {};
    const projects = await Project.find(query).populate('locationId').sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('GET projects error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  try {
    await connectToDatabase();
    const body = await req.json();
    const { name, locationId, description, status, startDate, endDate } = body;

    if (!name || !locationId) {
      return NextResponse.json({ error: 'Project name and location are required' }, { status: 400 });
    }

    const project = await Project.create({
      name,
      locationId,
      description,
      status: status || 'active',
      startDate,
      endDate,
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('POST project error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

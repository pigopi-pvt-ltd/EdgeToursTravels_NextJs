import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyAdmin, unauthorizedResponse, forbiddenResponse } from '@/lib/admin-auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const project = await Project.findById(id).populate('locationId');
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
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
    
    const updated = await Project.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== 'admin') return forbiddenResponse();

  try {
    await connectToDatabase();
    const { id } = await params;
    
    const deleted = await Project.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}

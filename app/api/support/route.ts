import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SupportTicket from '@/models/SupportTicket';
import { verifyToken } from '@/lib/jwt';

// For customers/drivers to create tickets
export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { subject, message, priority } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
  }

  await connectToDatabase();
  const ticket = await SupportTicket.create({
    userId: payload.userId,
    userRole: payload.role,
    subject,
    message,
    priority: priority || 'medium',
  });
  return NextResponse.json(ticket, { status: 201 });
}

// For employees to fetch tickets (and later update)
export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  // Allow only admin and employee to view all tickets
  if (payload.role !== 'admin' && payload.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const filter: any = {};
  if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) filter.status = status;

  const tickets = await SupportTicket.find(filter)
    .populate('userId', 'name email mobileNumber')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 });
  return NextResponse.json(tickets);
}
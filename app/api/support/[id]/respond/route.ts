import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import SupportTicket from '@/models/SupportTicket';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const { id } = await params;
  const { message, newStatus } = await req.json();
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  await connectToDatabase();
  const ticket = await SupportTicket.findById(id);
  if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

  // Only allow the ticket owner or admin/employee to reply
  if (ticket.userId.toString() !== payload.userId && payload.role !== 'admin' && payload.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  ticket.responses.push({
    userId: payload.userId,
    userRole: payload.role,
    message,
  });
  if (newStatus && payload.role !== 'customer' && payload.role !== 'driver') {
    ticket.status = newStatus;
  }
  await ticket.save();
  return NextResponse.json({ message: 'Response added', ticket });
}
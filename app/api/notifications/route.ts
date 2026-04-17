import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  const filter: any = { userId: payload.userId };
  if (unreadOnly) filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('bookingId', 'from destination dateTime status');

  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  await connectToDatabase();
  const { notificationIds } = await req.json(); // array of IDs
  if (!notificationIds || !Array.isArray(notificationIds)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await Notification.updateMany(
    { _id: { $in: notificationIds }, userId: payload.userId },
    { isRead: true }
  );

  return NextResponse.json({ message: 'Notifications marked as read' });
}
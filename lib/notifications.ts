import connectToDatabase from './mongodb';
import Notification from '@/models/Notification';
import { publishToUser } from '@/app/api/notifications/stream/route';

interface SendNotificationParams {
  userId: string;
  bookingId?: string;
  type: 'booking_created' | 'driver_assigned' | 'trip_accepted' | 'trip_rejected' | 'trip_completed' | 'trip_cancelled';
  title: string;
  message: string;
  metadata?: any;
}

export async function sendNotification({
  userId,
  bookingId,
  type,
  title,
  message,
  metadata,
}: SendNotificationParams) {
  await connectToDatabase();
  const notification = await Notification.create({
    userId,
    bookingId,
    type,
    title,
    message,
    metadata,
    isRead: false,
  });

  // Real‑time push via SSE
  publishToUser(userId, {
    id: notification._id,
    type: 'new_notification',
    notification: {
      _id: notification._id,
      title,
      message,
      type,
      createdAt: notification.createdAt,
    },
  });

  return notification;
}
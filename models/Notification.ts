import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;     // recipient
  bookingId: mongoose.Types.ObjectId;  // related booking
  title: string;
  message: string;
  type: 'booking_created' | 'driver_assigned' | 'trip_accepted' | 'trip_rejected' | 'trip_completed' | 'trip_cancelled';
  isRead: boolean;
  metadata?: any;                      // extra data like driverName, etc.
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: ['booking_created', 'driver_assigned', 'trip_accepted', 'trip_rejected', 'trip_completed', 'trip_cancelled'] },
  isRead: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
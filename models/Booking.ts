import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;      // customer who booked
  driverId?: mongoose.Types.ObjectId;   // assigned driver (optional)
  from: string;
  destination: string;
  dateTime: Date;
  name: string;                         // customer name (redundant, but for quick view)
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    from: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    dateTime: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
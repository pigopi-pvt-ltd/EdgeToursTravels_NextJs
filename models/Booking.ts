import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  from: string;
  destination: string;
  dateTime: Date;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    from: {
      type: String,
      required: [true, 'Pick-up location is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    dateTime: {
      type: Date,
      required: [true, 'Date and time are required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

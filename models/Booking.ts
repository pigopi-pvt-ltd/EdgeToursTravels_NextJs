import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;        
  from: string;
  destination: string;
  dateTime: Date;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' }, 
    from: { type: String, required: true },
    destination: { type: String, required: true },
    dateTime: { type: Date, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    driverResponse: { type: String, enum: ['accepted', 'rejected'], default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
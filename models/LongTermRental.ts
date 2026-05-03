import mongoose, { Schema, Document } from 'mongoose';

export interface ILongTermRental extends Document {
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  from: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  name: string;
  contact: string;
  price: number;
  status: 'pending' | 'assigned' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LongTermRentalSchema = new Schema<ILongTermRental>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    from: { type: String, required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'completed'],
      default: 'pending',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.LongTermRental ||
  mongoose.model<ILongTermRental>('LongTermRental', LongTermRentalSchema);
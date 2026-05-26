
import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  from: string;
  fromCoordinates?: { lat: number; lng: number };
  destination: string;
  toCoordinates?: { lat: number; lng: number };
  dateTime: Date;
  name: string;
  contact: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  driverResponse?: 'accepted' | 'rejected' | null;
  price?: string | number;
  createdAt: Date;
  updatedAt: Date;
  // Trip tracking fields
  otp?: string;
  otpExpiry?: Date;
  tripStarted: boolean;
  tripStartTime?: Date;
  tripEndTime?: Date;
  tripCompleted: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    updatedAt: Date;
  };
  distanceTraveled?: number;
  estimatedDuration?: number;
  actualDuration?: number;
  routePath?: Array<{ lat: number; lng: number; timestamp: Date }>;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    driverId: { type: Schema.Types.ObjectId, ref: 'User' },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    from: { type: String, required: true },
    fromCoordinates: { lat: Number, lng: Number },
    destination: { type: String, required: true },
    toCoordinates: { lat: Number, lng: Number },
    dateTime: { type: Date, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    price: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    driverResponse: { type: String, enum: ['accepted', 'rejected'], default: null },
    otp: { type: String },
    otpExpiry: { type: Date },
    tripStarted: { type: Boolean, default: false },
    tripStartTime: { type: Date },
    tripEndTime: { type: Date },
    tripCompleted: { type: Boolean, default: false },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      updatedAt: { type: Date, default: Date.now },
    },
    distanceTraveled: { type: Number },
    estimatedDuration: { type: Number },
    actualDuration: { type: Number },
    routePath: [{
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
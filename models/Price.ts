import mongoose, { Schema, Document } from 'mongoose';

export interface IPrice extends Document {
  vehicleType: string;
  category: 'sedan' | 'suv' | 'luxury' | 'bus' | 'tempo';
  baseFare: number;
  baseKm: number;
  pricePerKm: number;
  pricePerHour: number;
  driverAllowance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PriceSchema = new Schema<IPrice>(
  {
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type/name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['sedan', 'suv', 'luxury', 'bus', 'tempo'],
      required: true,
    },
    baseFare: {
      type: Number,
      required: true,
      default: 0,
    },
    baseKm: {
      type: Number,
      required: true,
      default: 80, // Default minimum KMs
    },
    pricePerKm: {
      type: Number,
      required: true,
      default: 0,
    },
    pricePerHour: {
      type: Number,
      required: true,
      default: 0,
    },
    driverAllowance: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Price || mongoose.model<IPrice>('Price', PriceSchema);

import mongoose, { Schema } from "mongoose";

// Re-using the address interface logic for consistency
interface IAddress {
  presentAddress: string;
  permanentAddress: string;
}

export interface ICustomer extends mongoose.Document, IAddress {
  fullName: string;
  mobileNumber: string;
  email: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  profilePhoto?: string;

  isVerified: boolean;
  loyaltyPoints: number;
  averageRating: number;

  savedLocations: Array<{
    label: string;
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }>;
  pickupTime?: {
    hour: number;
    minute: number;
  };

  isRegular: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  presentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dateOfBirth: { type: Date },
    profilePhoto: { type: String },

    isVerified: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5.0 },

    ...AddressSchema.obj,

    savedLocations: [
      {
        label: { type: String, default: "Home" },
        address: { type: String },
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    pickupTime: {
      hour: {
        type: Number,
        min: 0,
        max: 23,
      },
      minute: {
        type: Number,
        min: 0,
        max: 59,
      },
    },
    isRegular: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

CustomerSchema.index({ email: 1, mobileNumber: 1 });

export default mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

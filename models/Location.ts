import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, unique: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema, "branches");

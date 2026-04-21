import mongoose, { Schema } from 'mongoose';

export interface IVendor {
  vendorName: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  aadhar: string;
  dob: Date;
  pan: string;
  email: string;
  vendorProfilePhoto?: string;
  vendorAadharFront?: string;
  vendorAadharBack?: string;
  vendorPanImage?: string;
}

export interface IVehicle extends mongoose.Document {
  cabNumber: string;
  tacNo: string;
  licenseNo: string;
  pollutionNo: string;
  gstNo: string;
  insuranceNo: string;
  modelName: string;
  manufacturingNo?: string;
  expiryDate: Date;
  yearOfMaking: number;
  status: 'active' | 'inactive' | 'maintenance';
  vendor: IVendor;
  kycDocuments?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>({
  vendorName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  address: { type: String, required: true },
  aadhar: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  pan: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  vendorProfilePhoto: String,
  vendorAadharFront: String,
  vendorAadharBack: String,
  vendorPanImage: String,
});

const VehicleSchema = new Schema<IVehicle>({
  cabNumber: { type: String, required: true, unique: true },
  tacNo: { type: String, required: true },
  licenseNo: { type: String, required: true, unique: true },
  pollutionNo: { type: String, required: true },
  gstNo: { type: String, required: true },
  insuranceNo: { type: String, required: true },
  modelName: { type: String, required: true },
  manufacturingNo: { type: String },
  expiryDate: { type: Date, required: true },
  yearOfMaking: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  vendor: { type: VendorSchema, required: true },
  kycDocuments: { type: Map, of: String },
}, { timestamps: true });

export default mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
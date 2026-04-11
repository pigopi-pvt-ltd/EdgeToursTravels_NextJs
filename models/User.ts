import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDriverDetails {
  fullName?: string;
  dateOfBirth?: Date;
  drivingLicenseNumber?: string;
  dlExpiryDate?: Date;
  vehicleRegNumber?: string;
  vehicleType?: 'auto' | 'bike' | 'car';
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  aadhaarFront?: string;
  aadhaarBack?: string;
  drivingLicenseImage?: string;
  vehicleRCImage?: string;
  insuranceImage?: string;
  pucImage?: string;
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  kycStatus?: 'pending' | 'submitted' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  mobileNumber: string;
  name?: string;
  role: 'admin' | 'driver' ;   // only admin and driver
  profileCompleted: boolean;
  driverDetails?: IDriverDetails;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const DriverDetailsSchema = new Schema<IDriverDetails>({
  fullName: String,
  dateOfBirth: Date,
  drivingLicenseNumber: String,
  dlExpiryDate: Date,
  vehicleRegNumber: String,
  vehicleType: { type: String, enum: ['auto', 'bike', 'car'] },
  vehicleMake: String,
  vehicleModel: String,
  vehicleYear: Number,
  aadhaarFront: String,
  aadhaarBack: String,
  drivingLicenseImage: String,
  vehicleRCImage: String,
  insuranceImage: String,
  pucImage: String,
  accountHolderName: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: String,
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'driver'], default: 'driver' }, // ✅ default driver
  profileCompleted: { type: Boolean, default: false },
  driverDetails: DriverDetailsSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

UserSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.updatedAt = new Date();
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
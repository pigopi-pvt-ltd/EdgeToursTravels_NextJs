import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IAddress {
  presentAddress: string;
  permanentAddress: string;
}

export interface IDriverDetails extends IAddress {
  fullName: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  alternateMobile?: string;
  aadhar: string;
  dob: Date;
  pan: string;
  email: string;
  drivingLicense: string;
  yearsOfExperience: number;
  highestQualification: string;
  profilePhoto?: string;
  aadharFront?: string;
  aadharBack?: string;
  panImage?: string;
  licenseImage?: string;
  kycStatus?: 'pending' | 'approved' | 'rejected';
}

export interface IEmployeeDetails extends IAddress {
  fullName: string;
  mobile: string;
  gender: 'male' | 'female' | 'other';
  alternateMobile?: string;
  aadhar: string;
  dob: Date;
  pan: string;
  email: string;
  yearsOfExperience: number;
  highestQualification: string;
  previousExperience?: string;
  profilePhoto?: string;
  aadharFront?: string;
  aadharBack?: string;
  panImage?: string;
}

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  mobileNumber: string;
  name?: string;
  role: 'admin' | 'driver' | 'employee' | 'customer';
  profileCompleted: boolean;
  driverDetails?: IDriverDetails;
  employeeDetails?: IEmployeeDetails;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema({
  presentAddress: { type: String, required: true },
  permanentAddress: { type: String, required: true },
});

const DriverDetailsSchema = new Schema<IDriverDetails>({
  ...AddressSchema.obj,
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  alternateMobile: String,
  aadhar: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  pan: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  drivingLicense: { type: String, required: true, unique: true },
  yearsOfExperience: { type: Number, required: true },
  highestQualification: { type: String, required: true },
  profilePhoto: String,
  aadharFront: String,
  aadharBack: String,
  panImage: String,
  licenseImage: String,
  kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

const EmployeeDetailsSchema = new Schema<IEmployeeDetails>({
  ...AddressSchema.obj,
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  alternateMobile: String,
  aadhar: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  pan: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
  highestQualification: { type: String, required: true },
  previousExperience: String,
  profilePhoto: String,
  aadharFront: String,
  aadharBack: String,
  panImage: String,
});

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  name: String,
  role: { type: String, enum: ['admin', 'driver', 'employee', 'customer'], default: 'customer' },
  profileCompleted: { type: Boolean, default: false },
  driverDetails: DriverDetailsSchema,
  employeeDetails: EmployeeDetailsSchema,
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
import mongoose, { Schema } from 'mongoose';

export interface IAttendance extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'half-day';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    status: { type: String, enum: ['present', 'absent', 'half-day'], default: 'present' },
  },
  { timestamps: true }
);

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
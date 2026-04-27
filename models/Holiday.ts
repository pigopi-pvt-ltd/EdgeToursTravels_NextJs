import mongoose, { Schema } from 'mongoose';

export interface IHoliday extends mongoose.Document {
  name: string;
  date: Date;
  type: 'public' | 'optional' | 'company';
}

const HolidaySchema = new Schema<IHoliday>({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ['public', 'optional', 'company'], default: 'public' },
});

export default mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);
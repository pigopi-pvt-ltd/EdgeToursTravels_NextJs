import mongoose, { Schema } from 'mongoose';

interface ILineItem {
  label: string;
  amount: number;
}

export interface ISalary extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  employeeName?: string;
  month: string;
  year: number;
  earnings: ILineItem[];
  deductions: ILineItem[];
  netPayable: number;
  createdAt: Date;
  updatedAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
  label: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
});

const SalarySchema = new Schema<ISalary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employeeName: { type: String },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    earnings: [LineItemSchema],
    deductions: [LineItemSchema],
    netPayable: { type: Number, required: true },
  },
  { timestamps: true }
);

SalarySchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Salary || mongoose.model<ISalary>('Salary', SalarySchema);
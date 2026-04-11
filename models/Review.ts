import mongoose, { Schema } from 'mongoose';

export interface IReview extends mongoose.Document {
  customerName: string;
  customerEmail: string;
  rating: number;           
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminResponse: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// – no next parameter, just update the field
ReviewSchema.pre('save', function(this: IReview) {
  this.updatedAt = new Date();
});

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
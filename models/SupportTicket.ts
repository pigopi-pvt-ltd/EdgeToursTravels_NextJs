import mongoose, { Schema } from 'mongoose';

export interface ISupportTicket extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'customer' | 'driver' | 'employee' | 'admin';
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: mongoose.Types.ObjectId;
  responses: {
    userId: mongoose.Types.ObjectId;
    userRole: string;
    message: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, enum: ['customer', 'driver', 'employee', 'admin'], required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    responses: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userRole: { type: String, required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
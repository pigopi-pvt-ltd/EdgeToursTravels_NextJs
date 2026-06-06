import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  locationId: mongoose.Types.ObjectId;
  description?: string;
  status: "active" | "completed" | "on-hold";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    locationId: { type: Schema.Types.ObjectId, ref: "Location", required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["active", "completed", "on-hold"],
      default: "active",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

// Ensure project names are unique within a location
ProjectSchema.index({ name: 1, locationId: 1 }, { unique: true });

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

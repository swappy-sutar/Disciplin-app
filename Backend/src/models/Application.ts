import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  userId: Types.ObjectId;
  company: string;
  role: string;
  dateApplied: string; // YYYY-MM-DD
  status: 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected';
  link?: string;
  notes?: string;
  aiCoverLetter?: string;
  aiResumeBullets?: string[];
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  dateApplied: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  status: {
    type: String,
    enum: ['Applied', 'OA', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied',
    index: true,
  },
  link: { type: String, trim: true },
  notes: { type: String, trim: true },
  aiCoverLetter: { type: String, trim: true },
  aiResumeBullets: [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
});

ApplicationSchema.index({ userId: 1, dateApplied: -1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1 });

export const Application = model<IApplication>('Application', ApplicationSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatarUrl?: string;
  isApproved: boolean;
  userId?: Types.ObjectId;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  avatarUrl: { type: String, trim: true },
  isApproved: { type: Boolean, default: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now },
});

ReviewSchema.index({ isApproved: 1, createdAt: -1 });

export const Review = model<IReview>('Review', ReviewSchema);

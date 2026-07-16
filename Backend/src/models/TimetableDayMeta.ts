import { Schema, model, Document, Types } from 'mongoose';

export interface ITimetableDayMeta extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  isInitialized: boolean;
  createdAt: Date;
}

const TimetableDayMetaSchema = new Schema<ITimetableDayMeta>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // e.g. "2026-07-02"
  isInitialized: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure uniqueness of userId + date meta config
TimetableDayMetaSchema.index({ userId: 1, date: 1 }, { unique: true });

export const TimetableDayMeta = model<ITimetableDayMeta>('TimetableDayMeta', TimetableDayMetaSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IBodyMetric extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bodyFatPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BodyMetricSchema = new Schema<IBodyMetric>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    weightKg: { type: Number, required: true, min: 20, max: 300 },
    bodyFatPercent: { type: Number, min: 1, max: 70 },
  },
  {
    timestamps: true,
  }
);

// Enforce unique log per user per date
BodyMetricSchema.index({ userId: 1, date: 1 }, { unique: true });

export const BodyMetric = model<IBodyMetric>('BodyMetric', BodyMetricSchema);

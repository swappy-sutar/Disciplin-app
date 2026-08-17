import { Schema, model, Document, Types } from 'mongoose';

export interface ITimetableBlock extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  label: string;
  tag: 'Study' | 'Work' | 'Personal' | 'Health';
  isDone: boolean;
  order: number;
  createdAt: Date;
}

const TimetableBlockSchema = new Schema<ITimetableBlock>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // e.g. "2026-07-02"
  startTime: { type: String, required: true }, // e.g. "08:00"
  endTime: { type: String, required: true }, // e.g. "09:30"
  label: { type: String, required: true, trim: true },
  tag: { type: String, enum: ['Study', 'Work', 'Personal', 'Health'], default: 'Personal' },
  isDone: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

TimetableBlockSchema.index({ userId: 1, date: 1, order: 1, startTime: 1 });

export const TimetableBlock = model<ITimetableBlock>('TimetableBlock', TimetableBlockSchema);

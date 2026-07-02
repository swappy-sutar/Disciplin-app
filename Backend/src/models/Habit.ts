import { Schema, model, Document, Types } from 'mongoose';

export interface IHabit extends Document {
  userId: Types.ObjectId;
  name: string;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
}

const HabitSchema = new Schema<IHabit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#3B82F6' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Habit = model<IHabit>('Habit', HabitSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IHabitLog extends Document {
  userId: Types.ObjectId;
  habitId: Types.ObjectId;
  date: string;
  isDone: boolean;
  createdAt: Date;
}

const HabitLogSchema = new Schema<IHabitLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  date: { type: String, required: true },
  isDone: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export const HabitLog = model<IHabitLog>('HabitLog', HabitLogSchema);

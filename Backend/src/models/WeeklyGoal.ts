import { Schema, model, Document, Types } from 'mongoose';

export interface IWeeklyGoal extends Document {
  userId: Types.ObjectId;
  weekStartDate: string; // YYYY-MM-DD (representing Monday of the week)
  title: string;
  isDone: boolean;
  dueDay?: string; // Optional e.g. "Wednesday"
  createdAt: Date;
}

const WeeklyGoalSchema = new Schema<IWeeklyGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekStartDate: { type: String, required: true, index: true }, // Format: YYYY-MM-DD (always Monday)
  title: { type: String, required: true, trim: true },
  isDone: { type: Boolean, default: false },
  dueDay: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

export const WeeklyGoal = model<IWeeklyGoal>('WeeklyGoal', WeeklyGoalSchema);

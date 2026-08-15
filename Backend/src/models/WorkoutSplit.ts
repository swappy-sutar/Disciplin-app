import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkoutSplit extends Document {
  userId: Types.ObjectId;
  weekMap: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  active: boolean;
  generatedByAi: boolean;
  regenerationHistory: { date: Date; reason: string }[];
  updatedAt: Date;
}

const WorkoutSplitSchema = new Schema<IWorkoutSplit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  weekMap: {
    monday: { type: String, default: 'rest' },
    tuesday: { type: String, default: 'rest' },
    wednesday: { type: String, default: 'rest' },
    thursday: { type: String, default: 'rest' },
    friday: { type: String, default: 'rest' },
    saturday: { type: String, default: 'rest' },
    sunday: { type: String, default: 'rest' }
  },
  active: { type: Boolean, default: true },
  generatedByAi: { type: Boolean, default: false },
  regenerationHistory: [{
    date: { type: Date, default: Date.now },
    reason: { type: String, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Enforce unique active split per user, allowing multiple archived splits
WorkoutSplitSchema.index({ userId: 1, active: 1 }, { unique: true, partialFilterExpression: { active: true } });

export const WorkoutSplit = model<IWorkoutSplit>('WorkoutSplit', WorkoutSplitSchema);

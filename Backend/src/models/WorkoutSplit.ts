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
  updatedAt: Date;
}

const WorkoutSplitSchema = new Schema<IWorkoutSplit>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  weekMap: {
    monday: { type: String, default: 'rest' },
    tuesday: { type: String, default: 'rest' },
    wednesday: { type: String, default: 'rest' },
    thursday: { type: String, default: 'rest' },
    friday: { type: String, default: 'rest' },
    saturday: { type: String, default: 'rest' },
    sunday: { type: String, default: 'rest' }
  },
  updatedAt: { type: Date, default: Date.now }
});

export const WorkoutSplit = model<IWorkoutSplit>('WorkoutSplit', WorkoutSplitSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface ICoachMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface IWorkoutCoachThread extends Document {
  userId: Types.ObjectId;
  messages: ICoachMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const CoachMessageSchema = new Schema<ICoachMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const WorkoutCoachThreadSchema = new Schema<IWorkoutCoachThread>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  messages: [CoachMessageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const WorkoutCoachThread = model<IWorkoutCoachThread>('WorkoutCoachThread', WorkoutCoachThreadSchema);

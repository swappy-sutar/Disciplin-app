import { Schema, model, Document, Types } from 'mongoose';

export interface IWorkoutSessionSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  completed: boolean;
}

export interface IWorkoutSessionExercise {
  exerciseId: Types.ObjectId;
  sets: IWorkoutSessionSet[];
  notes?: string;
}

export interface IWorkoutSession extends Document {
  userId: Types.ObjectId;
  date: string; // YYYY-MM-DD
  muscleGroup: string;
  exercises: IWorkoutSessionExercise[];
  durationMinutes?: number;
  completed: boolean;
  completionRate?: number;
  painFlags?: string[];
  createdAt: Date;
}

const WorkoutSessionSchema = new Schema<IWorkoutSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  muscleGroup: { type: String, required: true },
  exercises: [{
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    sets: [{
      setNumber: { type: Number, required: true },
      reps: { type: Number, required: true, default: 0 },
      weightKg: { type: Number, required: true, default: 0 },
      completed: { type: Boolean, default: false }
    }],
    notes: { type: String }
  }],
  durationMinutes: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completionRate: { type: Number, default: 0 },
  painFlags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate completionRate from sets completed
WorkoutSessionSchema.pre<IWorkoutSession>('save', function (next) {
  let totalSets = 0;
  let completedSets = 0;
  if (this.exercises && this.exercises.length > 0) {
    for (const ex of this.exercises) {
      if (ex.sets) {
        totalSets += ex.sets.length;
        completedSets += ex.sets.filter(s => s.completed).length;
      }
    }
  }
  this.completionRate = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  next();
});

// Compound index to ensure uniqueness of user sessions per date
WorkoutSessionSchema.index({ userId: 1, date: 1 }, { unique: true });
WorkoutSessionSchema.index({ userId: 1, muscleGroup: 1, date: -1 });
WorkoutSessionSchema.index({ userId: 1, completed: 1, date: 1 });
WorkoutSessionSchema.index({ userId: 1, date: -1 });

export const WorkoutSession = model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);

import { Schema, model, Document, Types } from 'mongoose';

export type GoalType = 'weight_loss' | 'weight_gain' | 'muscle_build' | 'recomposition';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export interface IFitnessGoal extends Document {
  userId: Types.ObjectId;
  goalType: GoalType;
  startingWeightKg: number;
  targetWeightKg: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  targetDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessGoalSchema = new Schema<IFitnessGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalType: {
      type: String,
      enum: ['weight_loss', 'weight_gain', 'muscle_build', 'recomposition'],
      required: true,
    },
    startingWeightKg: { type: Number, required: true, min: 20, max: 300 },
    targetWeightKg: { type: Number, required: true, min: 20, max: 300 },
    heightCm: { type: Number, min: 50, max: 280 },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
      default: 'moderately_active',
      required: true,
    },
    targetDate: { type: Date },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Optimize query for active goal per user
FitnessGoalSchema.index(
  { userId: 1, isActive: 1 },
  { partialFilterExpression: { isActive: true } }
);

export const FitnessGoal = model<IFitnessGoal>('FitnessGoal', FitnessGoalSchema);

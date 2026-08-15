import { Schema, model, Document } from 'mongoose';

export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Glutes'
  | 'Core'
  | 'Cardio'
  | 'FullBody';

export type EquipmentType = 'Dumbbell' | 'Machine' | 'Barbell' | 'Bodyweight' | 'Kettlebell' | 'Bands' | 'Cable';

export interface IExercise extends Document {
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: EquipmentType;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  gifUrl: string;
  instructions: string[];
  slug: string;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Cardio', 'FullBody',
];

const EQUIPMENT_TYPES: EquipmentType[] = [
  'Dumbbell', 'Machine', 'Barbell', 'Bodyweight', 'Kettlebell', 'Bands', 'Cable',
];

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true, index: true },
    secondaryMuscles: [{ type: String, enum: MUSCLE_GROUPS }],
    equipment: { type: String, enum: EQUIPMENT_TYPES, required: true, index: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    imageUrl: { type: String, default: '' },
    gifUrl: { type: String, default: '' },
    instructions: [{ type: String }],
    slug: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

exerciseSchema.index({ muscleGroup: 1, equipment: 1 });

export const Exercise = model<IExercise>('Exercise', exerciseSchema);

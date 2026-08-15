import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
const equipmentTypes = ['Dumbbell', 'Machine', 'Barbell', 'Bodyweight', 'Kettlebell', 'Bands', 'Cable'] as const;

export const workoutSplitAiInputSchema = z.object({
  body: z.object({
    daysPerWeek: z.number().int().min(1).max(7, 'Days per week must be between 1 and 7'),
    goal: z.enum(['strength', 'hypertrophy', 'endurance', 'general_fitness', 'weight_loss']),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export const workoutSessionAiInputSchema = z.object({
  body: z.object({
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
    muscleGroup: z.string().min(1, 'Muscle group is required'),
    equipment: z.array(z.enum(equipmentTypes)).min(1, 'At least one equipment type is required'),
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    painFlags: z.array(z.string().min(1)).optional(),
  }),
});

export const parseWorkoutLogSchema = z.object({
  body: z.object({
    rawText: z.string().min(5, 'Workout log must be at least 5 characters long'),
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  }),
});

export const coachChatSchema = z.object({
  body: z.object({
    threadId: z.string().regex(mongoIdRegex, 'Invalid thread ID').optional(),
    message: z.string().min(1, 'Message cannot be empty'),
  }),
});

// Output Zod Schemas for validations
export const workoutSplitAiOutputSchema = z.object({
  weekMap: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
});

export const workoutSessionAiOutputSchema = z.object({
  muscleGroup: z.string(),
  durationMinutes: z.number().int().nonnegative().default(45),
  exercises: z.array(
    z.object({
      exerciseName: z.string().min(1),
      sets: z.array(
        z.object({
          setNumber: z.number().int().positive(),
          reps: z.number().int().nonnegative().default(0),
          weightKg: z.number().nonnegative().default(0),
          completed: z.boolean().default(false),
        })
      ).min(1),
      notes: z.string().optional(),
    })
  ).min(1),
});

export const detectEquipmentOutputSchema = z.object({
  detectedEquipment: z.array(z.enum(equipmentTypes)),
});

export const regenerateSplitOutputSchema = z.object({
  weekMap: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  explanation: z.string().min(1),
});

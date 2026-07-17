import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

const muscleGroups = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
  'FullBody',
  'rest'
] as const;

export const updateSplitSchema = z.object({
  body: z.object({
    weekMap: z.object({
      monday: z.enum(muscleGroups),
      tuesday: z.enum(muscleGroups),
      wednesday: z.enum(muscleGroups),
      thursday: z.enum(muscleGroups),
      friday: z.enum(muscleGroups),
      saturday: z.enum(muscleGroups),
      sunday: z.enum(muscleGroups)
    })
  })
});

export const saveSessionSchema = z.object({
  body: z.object({
    date: z.string().regex(dateRegex, 'date must be in YYYY-MM-DD format'),
    muscleGroup: z.string().min(1, 'muscleGroup is required'),
    durationMinutes: z.number().int().nonnegative().optional().default(0),
    completed: z.boolean().default(false),
    exercises: z.array(
      z.object({
        exerciseId: z.string().regex(mongoIdRegex, 'Invalid exercise ID'),
        notes: z.string().optional(),
        sets: z.array(
          z.object({
            setNumber: z.number().int().positive(),
            reps: z.number().int().nonnegative().default(0),
            weightKg: z.number().nonnegative().default(0),
            completed: z.boolean().default(false)
          })
        )
      })
    )
  })
});

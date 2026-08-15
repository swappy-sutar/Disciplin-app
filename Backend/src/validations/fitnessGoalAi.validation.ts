import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const fitnessGoalTypes = ['weight_loss', 'weight_gain', 'muscle_build', 'recomposition'] as const;
export const activityLevels = ['sedentary', 'lightly_active', 'moderately_active', 'very_active'] as const;

export const createFitnessGoalSchema = z.object({
  body: z.object({
    goalType: z.enum(fitnessGoalTypes, {
      errorMap: () => ({ message: 'Goal type must be weight_loss, weight_gain, muscle_build, or recomposition' }),
    }),
    startingWeightKg: z.number().positive('Starting weight must be positive').min(20).max(300),
    targetWeightKg: z.number().positive('Target weight must be positive').min(20).max(300),
    heightCm: z.number().positive('Height must be positive').min(50).max(280).optional(),
    activityLevel: z.enum(activityLevels).default('moderately_active'),
    targetDate: z.string().optional(),
  }),
});

export const createBodyMetricSchema = z.object({
  body: z.object({
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
    weightKg: z.number().positive('Weight must be positive').min(20).max(300),
    bodyFatPercent: z.number().min(1).max(70).optional(),
  }),
});

export const getBodyMetricsQuerySchema = z.object({
  query: z.object({
    days: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 90))
      .pipe(z.number().int().positive().max(365)),
  }),
});

export const goalProgramAiInputSchema = z.object({
  body: z.object({
    daysPerWeek: z.number().int().min(1).max(7, 'Days per week must be between 1 and 7'),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export const goalProgramAiOutputSchema = z.object({
  weekMap: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string(),
  }),
  calorieDirection: z.enum(['deficit', 'surplus', 'maintenance']),
  generalGuidance: z.string().min(10, 'Guidance must be at least 10 characters'),
});

export const goalProgressAiInputSchema = z.object({
  query: z.object({
    days: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 30))
      .pipe(z.number().int().positive().max(180)),
  }),
});

export const goalProgressAiOutputSchema = z.object({
  onTrack: z.boolean(),
  summary: z.string().min(5),
  adjustmentSuggestion: z.string().optional(),
});

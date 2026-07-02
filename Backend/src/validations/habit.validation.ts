import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const createHabitSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Habit name is required'),
    color: z.string().regex(hexColorRegex, 'Invalid hex color code').default('#3B82F6'),
    order: z.number().int().default(0),
  }),
});

export const updateHabitSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    color: z.string().regex(hexColorRegex).optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const getLogsSchema = z.object({
  query: z.object({
    startDate: z.string().regex(dateRegex, 'startDate must be in YYYY-MM-DD format'),
    endDate: z.string().regex(dateRegex, 'endDate must be in YYYY-MM-DD format'),
  }),
});

export const toggleLogSchema = z.object({
  body: z.object({
    habitId: z.string().min(1, 'habitId is required'),
    date: z.string().regex(dateRegex, 'date must be in YYYY-MM-DD format'),
    isDone: z.boolean(),
  }),
});

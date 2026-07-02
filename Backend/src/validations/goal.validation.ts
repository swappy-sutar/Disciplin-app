import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getGoalsSchema = z.object({
  query: z.object({
    week: z.string().regex(dateRegex, 'week parameter must be YYYY-MM-DD'),
  }),
});

export const createGoalSchema = z.object({
  body: z.object({
    weekStartDate: z.string().regex(dateRegex, 'weekStartDate must be YYYY-MM-DD (Monday)'),
    title: z.string().min(1, 'Title is required'),
    dueDay: z.string().optional(),
  }),
});

export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    isDone: z.boolean().optional(),
    dueDay: z.string().optional(),
  }),
});

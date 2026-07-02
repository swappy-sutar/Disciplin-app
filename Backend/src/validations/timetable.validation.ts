import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getTimetableSchema = z.object({
  query: z.object({
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
  }),
});

export const createBlockSchema = z.object({
  body: z.object({
    date: z.string().regex(dateRegex, 'Date must be in YYYY-MM-DD format'),
    startTime: z.string().regex(timeRegex, 'startTime must be in HH:MM format (24h)'),
    endTime: z.string().regex(timeRegex, 'endTime must be in HH:MM format (24h)'),
    label: z.string().min(1, 'Label is required'),
    tag: z.enum(['Study', 'Work', 'Personal', 'Health']).default('Personal'),
    order: z.number().int().default(0),
  }),
});

export const updateBlockSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID parameter is required'),
  }),
  body: z.object({
    date: z.string().regex(dateRegex).optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    label: z.string().min(1).optional(),
    tag: z.enum(['Study', 'Work', 'Personal', 'Health']).optional(),
    isDone: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
});

export const copyTemplateSchema = z.object({
  body: z.object({
    sourceDate: z.string().regex(dateRegex, 'sourceDate must be YYYY-MM-DD'),
    targetDate: z.string().regex(dateRegex, 'targetDate must be YYYY-MM-DD'),
  }),
});

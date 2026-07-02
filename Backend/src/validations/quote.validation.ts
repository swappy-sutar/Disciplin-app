import { z } from 'zod';

export const createQuoteSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Quote text is required'),
    author: z.string().optional().default('Unknown'),
  }),
});

export const favoriteQuoteSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

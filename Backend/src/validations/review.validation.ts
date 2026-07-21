import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
    role: z.string().trim().min(1, 'Role is required').max(100, 'Role must be 100 characters or less'),
    comment: z.string().trim().min(1, 'Comment is required').max(1000, 'Comment must be 1000 characters or less'),
    rating: z.number().int().min(1).max(5).optional().default(5),
    avatarUrl: z.string().url('Invalid avatar URL format').or(z.literal('')).optional(),
  }),
});

import { z } from 'zod';

const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const mongoIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid ID format'),
  }),
});

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid user ID format'),
  }),
  body: z.object({
    role: z.enum(['user', 'admin', 'moderator', 'premium'], {
      errorMap: () => ({ message: 'Role must be one of: user, admin, moderator, premium' }),
    }),
  }),
});

export const toggleReviewApprovalSchema = z.object({
  params: z.object({
    id: z.string().regex(mongoIdRegex, 'Invalid review ID format'),
  }),
  body: z.object({
    isApproved: z.boolean({
      required_error: 'isApproved field is required',
    }),
  }),
});

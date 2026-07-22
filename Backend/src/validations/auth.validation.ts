import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less'),
    email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
    password: z.string().min(1, 'Password is required').max(128, 'Password too long'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be 100 characters or less').optional(),
    email: z.string().trim().email('Invalid email address').max(255, 'Email too long').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password too long').optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(128, 'Password too long'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().trim().min(10, 'Google ID token is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().trim().min(1, 'Verification token is required'),
  }),
});

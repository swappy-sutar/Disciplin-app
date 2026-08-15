import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const getApplicationsSchema = z.object({
  query: z.object({
    date: z.string().regex(dateRegex).optional(),
    startDate: z.string().regex(dateRegex).optional(),
    endDate: z.string().regex(dateRegex).optional(),
  }),
});

export const createApplicationSchema = z.object({
  body: z.object({
    company: z.string().min(1, 'Company is required'),
    role: z.string().min(1, 'Role is required'),
    dateApplied: z.string().regex(dateRegex, 'dateApplied must be YYYY-MM-DD'),
    status: z.enum(['Applied', 'OA', 'Interview', 'Offer', 'Rejected']).default('Applied'),
    link: z.string().url('Invalid URL').or(z.string().length(0)).optional().nullable(),
    notes: z.string().optional().nullable(),
    aiCoverLetter: z.string().optional().nullable(),
    aiResumeBullets: z.array(z.string()).optional().nullable(),
  }),
});

export const updateApplicationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    company: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    dateApplied: z.string().regex(dateRegex).optional(),
    status: z.enum(['Applied', 'OA', 'Interview', 'Offer', 'Rejected']).optional(),
    link: z.string().url('Invalid URL').or(z.string().length(0)).optional().nullable(),
    notes: z.string().optional().nullable(),
    aiCoverLetter: z.string().optional().nullable(),
    aiResumeBullets: z.array(z.string()).optional().nullable(),
  }),
});

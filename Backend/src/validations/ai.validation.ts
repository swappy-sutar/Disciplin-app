import { z } from 'zod';

export const coverLetterSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long'),
    userProfile: z.string().optional(),
    company: z.string().optional(),
    role: z.string().optional(),
  }),
});

export const resumeBulletsSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters long'),
    rawExperience: z.string().min(10, 'Raw experience notes must be at least 10 characters long'),
    company: z.string().optional(),
    role: z.string().optional(),
  }),
});

export const coverLetterOutputSchema = z.object({
  coverLetter: z.string().min(1, 'Cover letter text cannot be empty'),
});

export const resumeBulletsOutputSchema = z.object({
  bullets: z.array(z.string().min(1)).min(1, 'At least 1 bullet point is required'),
});

export const studyPlanSchema = z.object({
  body: z.object({
    topicName: z.string().min(2, 'Topic name must be at least 2 characters long'),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  }),
});

export const studyPlanOutputSchema = z.object({
  subTopics: z.array(
    z.object({
      title: z.string().min(1, 'Sub-topic title cannot be empty'),
    })
  ).min(1, 'At least one sub-topic is required'),
});

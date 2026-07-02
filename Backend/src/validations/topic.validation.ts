import { z } from 'zod';

export const createTopicSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Category is required'),
    subTopics: z
      .array(
        z.object({
          title: z.string().min(1, 'Subtopic title is required'),
          isDone: z.boolean().default(false),
        })
      )
      .optional()
      .default([]),
  }),
});

export const updateTopicSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    progressPercent: z.number().min(0).max(100).optional(),
    subTopics: z
      .array(
        z.object({
          _id: z.string().optional(),
          title: z.string().min(1),
          isDone: z.boolean(),
        })
      )
      .optional(),
  }),
});

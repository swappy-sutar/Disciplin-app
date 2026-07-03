import { z } from 'zod';

export const createNoteSchema = z.object({
  params: z.object({
    topicId: z.string().min(1, 'Topic ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    bodyMarkdown: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updateNoteSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    bodyMarkdown: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const createQAItemSchema = z.object({
  params: z.object({
    topicId: z.string().min(1, 'Topic ID is required'),
  }),
  body: z.object({
    question: z.string().min(1, 'Question is required'),
    answerMarkdown: z.string().optional().default(''),
    frequency: z.enum(['common', 'occasional', 'rare']).optional().default('occasional'),
    companyTags: z.array(z.string()).optional().default([]),
    confidence: z.enum(['weak', 'ok', 'strong']).optional().default('weak'),
  }),
});

export const updateQAItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    question: z.string().min(1).optional(),
    answerMarkdown: z.string().optional(),
    frequency: z.enum(['common', 'occasional', 'rare']).optional(),
    companyTags: z.array(z.string()).optional(),
    confidence: z.enum(['weak', 'ok', 'strong']).optional(),
  }),
});

export const createCodingQuestionSchema = z.object({
  params: z.object({
    topicId: z.string().min(1, 'Topic ID is required'),
  }),
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    problemMarkdown: z.string().optional().default(''),
    solutionCode: z.string().optional().default(''),
    solutionLanguage: z.string().optional().default('typescript'),
    approachNotes: z.string().optional().default(''),
    timeComplexity: z.string().optional().default(''),
    spaceComplexity: z.string().optional().default(''),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    sourceUrl: z.string().optional(),
    confidence: z.enum(['weak', 'ok', 'strong']).optional().default('weak'),
  }),
});

export const updateCodingQuestionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    problemMarkdown: z.string().optional(),
    solutionCode: z.string().optional(),
    solutionLanguage: z.string().optional(),
    approachNotes: z.string().optional(),
    timeComplexity: z.string().optional(),
    spaceComplexity: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    sourceUrl: z.string().optional(),
    confidence: z.enum(['weak', 'ok', 'strong']).optional(),
  }),
});

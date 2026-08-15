import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { AIService } from '../src/services/ai.service';
import { AppError } from '../src/utils/custom-errors';

const mockCreate = vi.fn();

vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };
    }),
  };
});


describe('AI Router Endpoints (/api/v1/ai/*)', () => {
  const testUser = {
    name: 'AI Test User',
    email: 'aitest@example.com',
    password: 'password123',
  };

  const getToken = async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    await User.updateOne({ email: testUser.email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    return loginRes.body.data.token;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    mockCreate.mockReset();
  });

  describe('POST /api/v1/ai/cover-letter', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/v1/ai/cover-letter')
        .send({ jobDescription: 'Looking for a Senior Software Engineer with Node.js experience.' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 validation error if jobDescription is less than 10 chars', async () => {
      const token = await getToken();
      const res = await request(app)
        .post('/api/v1/ai/cover-letter')
        .set('Authorization', `Bearer ${token}`)
        .send({ jobDescription: 'Short' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and a tailored cover letter draft on success', async () => {
      const token = await getToken();
      vi.spyOn(AIService, 'generateCoverLetter').mockResolvedValueOnce(
        'Dear Hiring Manager,\n\nI am thrilled to apply for the Senior Frontend Engineer position...'
      );

      const res = await request(app)
        .post('/api/v1/ai/cover-letter')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: 'Acme Corp',
          role: 'Senior Frontend Engineer',
          jobDescription: 'We are seeking an experienced React 19 and TypeScript engineer to build dashboard tools.',
          userProfile: '5 years experience building web applications with React and Tailwind CSS.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.coverLetter).toContain('Dear Hiring Manager');
    });

    it('should return clean 503 error response when Gemini API is unavailable or unconfigured', async () => {
      const token = await getToken();
      vi.spyOn(AIService, 'generateCoverLetter').mockRejectedValueOnce(
        new AppError(503, 'AI features are unavailable: GEMINI_API_KEY is not configured on the server.')
      );

      const res = await request(app)
        .post('/api/v1/ai/cover-letter')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: 'Acme Corp',
          role: 'Engineer',
          jobDescription: 'Requires solid problem solving and TypeScript expertise.',
        });

      expect(res.status).toBe(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('AI features are unavailable');
    });
  });

  describe('POST /api/v1/ai/resume-bullets', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/v1/ai/resume-bullets')
        .send({
          jobDescription: 'Build high throughput microservices in Express and Node.',
          rawExperience: 'Built REST APIs and optimized SQL queries.',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and bullet points array on success', async () => {
      const token = await getToken();
      const mockBullets = [
        'Architected high-throughput microservices using Express and TypeScript, boosting API throughput by 35%.',
        'Implemented Zod validation schemas across 12 endpoints to guarantee payload integrity.',
        'Optimized MongoDB indexes and query execution plans, cutting P99 latency by 40ms.',
      ];

      vi.spyOn(AIService, 'generateResumeBullets').mockResolvedValueOnce(mockBullets);

      const res = await request(app)
        .post('/api/v1/ai/resume-bullets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          company: 'TechFlow',
          role: 'Backend Developer',
          jobDescription: 'Seeking Node.js and Express developer to maintain microservices.',
          rawExperience: 'Built microservices with Node.js, Express, and MongoDB.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bullets).toHaveLength(3);
      expect(res.body.data.bullets[0]).toContain('Architected high-throughput microservices');
    });

    it('should return clean 429 error response when rate limit is exceeded', async () => {
      const token = await getToken();
      vi.spyOn(AIService, 'generateResumeBullets').mockRejectedValueOnce(
        new AppError(429, 'Gemini AI rate limit reached. Please wait a moment and try again.')
      );

      const res = await request(app)
        .post('/api/v1/ai/resume-bullets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          jobDescription: 'Seeking backend Node.js developer to optimize throughput.',
          rawExperience: 'Built REST APIs and worked with MongoDB database.',
        });

      expect(res.status).toBe(429);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('rate limit reached');
    });
  });

  describe('POST /api/v1/ai/study-plan', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/v1/ai/study-plan')
        .send({
          topicName: 'Node.js event loop',
          skillLevel: 'intermediate',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 validation error if topicName is less than 2 chars', async () => {
      const token = await getToken();
      const res = await request(app)
        .post('/api/v1/ai/study-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topicName: 'N',
          skillLevel: 'intermediate',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 validation error if skillLevel is invalid', async () => {
      const token = await getToken();
      const res = await request(app)
        .post('/api/v1/ai/study-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topicName: 'Node.js event loop',
          skillLevel: 'expert',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 200 and structured sub-topics array on success', async () => {
      const token = await getToken();
      const mockSubTopics = [
        { title: 'Introduction to Event Loop' },
        { title: 'Phases of Event Loop' },
        { title: 'Macrotasks and Microtasks' },
      ];

      vi.spyOn(AIService, 'generateStudyPlan').mockResolvedValueOnce(mockSubTopics);

      const res = await request(app)
        .post('/api/v1/ai/study-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topicName: 'Node.js event loop',
          skillLevel: 'intermediate',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subTopics).toHaveLength(3);
      expect(res.body.data.subTopics[0].title).toBe('Introduction to Event Loop');
    });

    it('should return clean 502 error response when generation fails', async () => {
      const token = await getToken();
      vi.spyOn(AIService, 'generateStudyPlan').mockRejectedValueOnce(
        new AppError(502, 'Failed to generate a valid study plan from AI: Malformed JSON output')
      );

      const res = await request(app)
        .post('/api/v1/ai/study-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          topicName: 'Node.js event loop',
          skillLevel: 'intermediate',
        });

      expect(res.status).toBe(502);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Failed to generate a valid study plan');
    });
  });

  describe('AIService.generateStudyPlan (Service Unit Tests)', () => {
    it('should successfully parse and return subtopics on valid JSON response', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subTopics: [
                  { title: 'Subtopic A' },
                  { title: 'Subtopic B' },
                ],
              }),
            },
          },
        ],
      });

      const res = await AIService.generateStudyPlan({
        topicName: 'React hooks',
        skillLevel: 'beginner',
      });

      expect(res).toHaveLength(2);
      expect(res[0].title).toBe('Subtopic A');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should retry once and succeed if the first response is malformed JSON', async () => {
      mockCreate
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'invalid json content 1' } }],
        })
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  subTopics: [{ title: 'Subtopic C' }],
                }),
              },
            },
          ],
        });

      const res = await AIService.generateStudyPlan({
        topicName: 'React hooks',
        skillLevel: 'beginner',
      });

      expect(res).toHaveLength(1);
      expect(res[0].title).toBe('Subtopic C');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should throw 502 AppError if both attempts fail validation or JSON parse', async () => {
      mockCreate
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'invalid json content 1' } }],
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'invalid json content 2' } }],
        });

      await expect(
        AIService.generateStudyPlan({
          topicName: 'React hooks',
          skillLevel: 'beginner',
        })
      ).rejects.toThrowError('Failed to generate a valid study plan from AI');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });
  });
});

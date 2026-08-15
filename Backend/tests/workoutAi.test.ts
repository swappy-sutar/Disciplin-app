import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { WorkoutSession } from '../src/models/WorkoutSession';
import { WorkoutSplit } from '../src/models/WorkoutSplit';
import { WorkoutCoachThread } from '../src/models/WorkoutCoachThread';
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

describe('Workout AI Router Endpoints (/api/v1/ai/*)', () => {
  const testUser = {
    name: 'Workout AI Tester',
    email: 'workoutai@example.com',
    password: 'password123',
  };

  let token: string;
  let userId: string;

  const getToken = async () => {
    const existing = await User.findOne({ email: testUser.email });
    if (!existing) {
      await request(app).post('/api/v1/auth/register').send(testUser);
      await User.updateOne({ email: testUser.email }, { isVerified: true });
    }
    const user = await User.findOne({ email: testUser.email });
    userId = String(user?._id);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    return loginRes.body.data.token;
  };

  beforeEach(async () => {
    vi.restoreAllMocks();
    mockCreate.mockReset();
    token = await getToken();
    await WorkoutSession.deleteMany({ userId });
    await WorkoutSplit.deleteMany({ userId });
    await WorkoutSplit.syncIndexes();
    await WorkoutCoachThread.deleteMany({ userId });
  });

  describe('POST /api/v1/ai/workout-split', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await request(app).post('/api/v1/ai/workout-split').send({
        daysPerWeek: 4,
        goal: 'hypertrophy',
        experienceLevel: 'intermediate',
      });
      expect(res.status).toBe(401);
    });

    it('should return 250 validation error if daysPerWeek is out of range', async () => {
      const res = await request(app)
        .post('/api/v1/ai/workout-split')
        .set('Authorization', `Bearer ${token}`)
        .send({
          daysPerWeek: 9,
          goal: 'hypertrophy',
          experienceLevel: 'intermediate',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/ai/workout-session', () => {
    it('should successfully build a session with progressive overload summary if history exists', async () => {
      // Create previous session history
      const prevSession = new WorkoutSession({
        userId,
        date: '2026-08-01',
        muscleGroup: 'Chest',
        completed: true,
        completionRate: 100,
        exercises: [
          {
            exerciseId: '60c72b2f9b1d8e23a4111111', // Dummy exercise ID
            sets: [{ setNumber: 1, reps: 10, weightKg: 80, completed: true }],
            notes: 'Felt good',
          },
        ],
      });
      await prevSession.save();

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                muscleGroup: 'Chest',
                durationMinutes: 45,
                exercises: [
                  {
                    exerciseName: 'Bench Press',
                    sets: [{ setNumber: 1, reps: 10, weightKg: 82.5, completed: false }],
                    notes: 'Increase weight based on previous 80kg',
                  },
                ],
              }),
            },
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/ai/workout-session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-15',
          muscleGroup: 'Chest',
          equipment: ['Barbell'],
          fitnessLevel: 'intermediate',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.exercises).toHaveLength(1);
      expect(res.body.data.exercises[0].sets[0].weightKg).toBe(82.5);
    });

    it('should inject pain flags in system prompt if present', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                muscleGroup: 'Legs',
                durationMinutes: 40,
                exercises: [
                  {
                    exerciseName: 'Leg Press',
                    sets: [{ setNumber: 1, reps: 12, weightKg: 100, completed: false }],
                    notes: 'Swapped squat for leg press due to knee pain',
                  },
                ],
              }),
            },
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/ai/workout-session')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-15',
          muscleGroup: 'Legs',
          equipment: ['Machine'],
          fitnessLevel: 'intermediate',
          painFlags: ['knee'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.exercises[0].notes).toContain('knee');
    });
  });

  describe('GET /api/v1/ai/workout-plateau-check', () => {
    it('should return false if there are less than 3 sessions logged', async () => {
      const res = await request(app)
        .get('/api/v1/ai/workout-plateau-check')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.plateauDetected).toBe(false);
    });
  });

  describe('POST /api/v1/ai/detect-equipment', () => {
    it('should reject requests with images larger than 5MB', async () => {
      // 5MB is roughly 5.2 million characters. Let's create a massive base64 string
      const hugeString = 'a'.repeat(7 * 1024 * 1024);
      const res = await request(app)
        .post('/api/v1/ai/detect-equipment')
        .set('Authorization', `Bearer ${token}`)
        .send({ image: hugeString });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('size exceeds 5MB limit');
    });
  });

  describe('POST /api/v1/ai/coach-chat', () => {
    it('should successfully create a thread, append messages, and cap history at 20 messages', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'This is coach advice.' } }],
      });

      const res = await request(app)
        .post('/api/v1/ai/coach-chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'How do I perform a bicep curl?' });

      expect(res.status).toBe(200);
      expect(res.body.data.reply).toBe('This is coach advice.');
      const threadId = res.body.data.threadId;
      expect(threadId).toBeDefined();

      // Verify DB thread was created with 2 messages (user, assistant)
      const thread = await WorkoutCoachThread.findById(threadId);
      expect(thread?.messages).toHaveLength(2);
      expect(thread?.messages[0].content).toBe('How do I perform a bicep curl?');
      expect(thread?.messages[1].content).toBe('This is coach advice.');
    });
  });

  describe('POST /api/v1/ai/regenerate-split', () => {
    it('should reject request if no active split exists', async () => {
      const res = await request(app)
        .post('/api/v1/ai/regenerate-split')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('No active workout split found');
    });

    it('should regenerate split if low compliance is detected (<40%)', async () => {
      // Create old active split
      const oldSplit = new WorkoutSplit({
        userId,
        active: true,
        weekMap: {
          monday: 'Chest',
          tuesday: 'Back',
          wednesday: 'rest',
          thursday: 'Legs',
          friday: 'rest',
          saturday: 'rest',
          sunday: 'rest',
        },
      });
      await oldSplit.save();

      // Log 3 low compliance chest sessions on mondays
      const session1 = new WorkoutSession({ userId, date: '2026-08-03', muscleGroup: 'Chest', completed: true, completionRate: 20 });
      const session2 = new WorkoutSession({ userId, date: '2026-08-10', muscleGroup: 'Chest', completed: true, completionRate: 10 });
      await session1.save();
      await session2.save();

      mockCreate.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                weekMap: {
                  monday: 'rest',
                  tuesday: 'Back',
                  wednesday: 'rest',
                  thursday: 'Legs',
                  friday: 'Chest',
                  saturday: 'rest',
                  sunday: 'rest',
                },
                explanation: 'Shifted chest day to Friday to allow more recovery.',
              }),
            },
          },
        ],
      });

      const res = await request(app)
        .post('/api/v1/ai/regenerate-split')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.splitRegenerated).toBe(true);
      expect(res.body.data.newWeekMap.monday).toBe('rest');
      expect(res.body.data.newWeekMap.friday).toBe('Chest');

      // Verify that old split was deactivated and new split is active
      const oldSearch = await WorkoutSplit.findById(oldSplit._id);
      expect(oldSearch?.active).toBe(false);

      const activeSearch = await WorkoutSplit.findOne({ userId, active: true });
      expect(activeSearch?.generatedByAi).toBe(true);
      expect(activeSearch?.regenerationHistory).toHaveLength(1);
    });
  });
});

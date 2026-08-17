import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { FitnessGoal } from '../../src/models/FitnessGoal.model';
import { BodyMetric } from '../../src/models/BodyMetric.model';
import { WorkoutSplit } from '../../src/models/WorkoutSplit';
import { createTestUser } from '../helpers/authHelper';

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

describe('Fitness Goal & Goal AI Module Endpoints', () => {
  let userId: string;
  let token: string;

  beforeEach(async () => {
    vi.restoreAllMocks();
    mockCreate.mockReset();
    const testCtx = await createTestUser();
    userId = String(testCtx.user._id);
    token = testCtx.token;
    await FitnessGoal.deleteMany({ userId });
    await BodyMetric.deleteMany({ userId });
    await WorkoutSplit.deleteMany({ userId });
  });

  describe('1. Fitness Goal CRUD (/api/v1/fitness-goals)', () => {
    it('should create a new active fitness goal', async () => {
      const res = await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'weight_loss',
          startingWeightKg: 85.5,
          targetWeightKg: 78.0,
          heightCm: 180,
          activityLevel: 'moderately_active',
          targetDate: '2026-12-31',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.goalType).toBe('weight_loss');
      expect(res.body.data.startingWeightKg).toBe(85.5);
      expect(res.body.data.targetWeightKg).toBe(78.0);
      expect(res.body.data.isActive).toBe(true);
    });

    it('should deactivate previously active goal when a new goal is created', async () => {
      // Create first goal
      const firstRes = await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'weight_loss',
          startingWeightKg: 90,
          targetWeightKg: 80,
          activityLevel: 'lightly_active',
        });
      expect(firstRes.status).toBe(201);
      const firstId = firstRes.body.data._id;

      // Create second goal
      const secondRes = await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'muscle_build',
          startingWeightKg: 80,
          targetWeightKg: 84,
          activityLevel: 'very_active',
        });
      expect(secondRes.status).toBe(201);

      // Verify first goal is now inactive
      const oldGoal = await FitnessGoal.findById(firstId);
      expect(oldGoal?.isActive).toBe(false);

      // Verify active endpoint returns the second goal
      const activeRes = await request(app)
        .get('/api/v1/fitness-goals/active')
        .set('Authorization', `Bearer ${token}`);
      expect(activeRes.status).toBe(200);
      expect(activeRes.body.data._id).toBe(secondRes.body.data._id);
      expect(activeRes.body.data.goalType).toBe('muscle_build');
    });

    it('should reject invalid goal type or invalid weights', async () => {
      const res = await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'invalid_goal_type',
          startingWeightKg: -10,
          targetWeightKg: 0,
        });

      expect(res.status).toBe(400);
    });

    it('should return null when no active goal exists', async () => {
      const res = await request(app)
        .get('/api/v1/fitness-goals/active')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeNull();
    });
  });

  describe('2. Body Metrics CRUD (/api/v1/body-metrics)', () => {
    it('should log a new body metric entry', async () => {
      const res = await request(app)
        .post('/api/v1/body-metrics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-01',
          weightKg: 82.4,
          bodyFatPercent: 18.5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weightKg).toBe(82.4);
      expect(res.body.data.bodyFatPercent).toBe(18.5);
      expect(res.body.data.date).toBe('2026-08-01');
    });

    it('should upsert when logging on the same date for the same user', async () => {
      // Initial log
      await request(app)
        .post('/api/v1/body-metrics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-02',
          weightKg: 82.0,
          bodyFatPercent: 18.2,
        });

      // Update same date with new weight
      const updateRes = await request(app)
        .post('/api/v1/body-metrics')
        .set('Authorization', `Bearer ${token}`)
        .send({
          date: '2026-08-02',
          weightKg: 81.7,
          bodyFatPercent: 18.0,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.weightKg).toBe(81.7);

      // Verify only 1 record exists for this date
      const totalCount = await BodyMetric.countDocuments({ userId, date: '2026-08-02' });
      expect(totalCount).toBe(1);
    });

    it('should list historical metrics sorted ascending by date', async () => {
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-05', weightKg: 81.0 });
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-01', weightKg: 82.5 });
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-03', weightKg: 81.8 });

      const res = await request(app)
        .get('/api/v1/body-metrics?days=30')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(3);
      expect(res.body.data[0].date).toBe('2026-08-01');
      expect(res.body.data[1].date).toBe('2026-08-03');
      expect(res.body.data[2].date).toBe('2026-08-05');
    });
  });

  describe('3. AI Goal Program Generator (/api/v1/ai/goal-program)', () => {
    it('should return 400 if user does not have an active fitness goal', async () => {
      const res = await request(app)
        .post('/api/v1/ai/goal-program')
        .set('Authorization', `Bearer ${token}`)
        .send({
          daysPerWeek: 4,
          experienceLevel: 'intermediate',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/active fitness goal/i);
    });

    it('should generate a goal-aware workout split and return general guidance', async () => {
      // Create active goal
      await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'weight_loss',
          startingWeightKg: 85,
          targetWeightKg: 78,
          activityLevel: 'moderately_active',
        });

      const mockAiResponse = {
        weekMap: {
          monday: 'Chest',
          tuesday: 'Back',
          wednesday: 'rest',
          thursday: 'Legs',
          friday: 'Shoulders',
          saturday: 'rest',
          sunday: 'rest',
        },
        calorieDirection: 'deficit',
        generalGuidance: 'Maintain a moderate caloric deficit prioritizing whole foods and lean protein. Stay consistently hydrated and aim for 7-8 hours of restful sleep for recovery.',
      };

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockAiResponse) } }],
      });

      const res = await request(app)
        .post('/api/v1/ai/goal-program')
        .set('Authorization', `Bearer ${token}`)
        .send({
          daysPerWeek: 4,
          experienceLevel: 'intermediate',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.calorieDirection).toBe('deficit');
      expect(res.body.data.generalGuidance).toContain('deficit');
      expect(res.body.data.workoutSplit.weekMap.monday).toBe('Chest');
      expect(res.body.data.workoutSplit.generatedByAi).toBe(true);

      // Verify active workout split is saved in DB
      const activeSplit = await WorkoutSplit.findOne({ userId, active: true });
      expect(activeSplit).not.toBeNull();
      expect(activeSplit?.generatedByAi).toBe(true);
    });

    it('should retry once on malformed JSON and succeed if retry returns valid schema', async () => {
      await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'muscle_build',
          startingWeightKg: 75,
          targetWeightKg: 80,
          activityLevel: 'very_active',
        });

      const validResponse = {
        weekMap: {
          monday: 'Chest',
          tuesday: 'Back',
          wednesday: 'Legs',
          thursday: 'Shoulders',
          friday: 'rest',
          saturday: 'rest',
          sunday: 'rest',
        },
        calorieDirection: 'surplus',
        generalGuidance: 'Aim for a slight caloric surplus prioritizing 1.6-2.0g protein per kg of bodyweight with consistent progressive overload.',
      };

      // 1st call fails with invalid JSON, 2nd call succeeds
      mockCreate
        .mockResolvedValueOnce({ choices: [{ message: { content: 'not-valid-json' } }] })
        .mockResolvedValueOnce({ choices: [{ message: { content: JSON.stringify(validResponse) } }] });

      const res = await request(app)
        .post('/api/v1/ai/goal-program')
        .set('Authorization', `Bearer ${token}`)
        .send({
          daysPerWeek: 4,
          experienceLevel: 'advanced',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.calorieDirection).toBe('surplus');
    });

    it('should return 502 error if Gemini consistently returns invalid output', async () => {
      await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'recomposition',
          startingWeightKg: 75,
          targetWeightKg: 75,
          activityLevel: 'moderately_active',
        });

      mockCreate.mockResolvedValue({ choices: [{ message: { content: 'invalid response' } }] });

      const res = await request(app)
        .post('/api/v1/ai/goal-program')
        .set('Authorization', `Bearer ${token}`)
        .send({
          daysPerWeek: 3,
          experienceLevel: 'beginner',
        });

      expect(res.status).toBe(502);
    });
  });

  describe('4. AI Goal Progress Check (/api/v1/ai/goal-progress)', () => {
    it('should return 404 if no active fitness goal exists', async () => {
      const res = await request(app)
        .get('/api/v1/ai/goal-progress')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should skip Gemini call and return helpful message if fewer than 3 logs exist', async () => {
      await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'weight_loss',
          startingWeightKg: 85,
          targetWeightKg: 78,
          activityLevel: 'moderately_active',
        });

      // Only 2 entries
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-01', weightKg: 85.0 });
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-07', weightKg: 84.5 });

      const res = await request(app)
        .get('/api/v1/ai/goal-progress')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.onTrack).toBeNull();
      expect(res.body.data.summary).toMatch(/Log at least 3 entries/i);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should calculate rate of change and call Gemini to phrase feedback when >= 3 logs exist', async () => {
      await request(app)
        .post('/api/v1/fitness-goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          goalType: 'weight_loss',
          startingWeightKg: 85,
          targetWeightKg: 78,
          activityLevel: 'moderately_active',
        });

      // 3 entries over 14 days showing steady weight loss (-0.5 kg/week)
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-01', weightKg: 85.0 });
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-08', weightKg: 84.4 });
      await request(app).post('/api/v1/body-metrics').set('Authorization', `Bearer ${token}`).send({ date: '2026-08-15', weightKg: 84.0 });

      const mockProgressOutput = {
        onTrack: true,
        summary: 'Excellent momentum! You have lost 1.0 kg over the past two weeks at a safe and sustainable rate of 0.5 kg per week.',
        adjustmentSuggestion: 'Continue your current training cadence and maintain high protein intake.',
      };

      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockProgressOutput) } }],
      });

      const res = await request(app)
        .get('/api/v1/ai/goal-progress?days=30')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.onTrack).toBe(true);
      expect(res.body.data.summary).toContain('momentum');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});

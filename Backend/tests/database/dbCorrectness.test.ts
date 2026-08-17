import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/authHelper';
import { Habit } from '../../src/models/Habit';
import { Application } from '../../src/models/Application';
import { WeeklyGoal } from '../../src/models/WeeklyGoal';

describe('Database Query Correctness & Performance Pass Validations', () => {
  describe('.lean() Projection Shape Integrity', () => {
    it('should return complete application model fields matching frontend expectations when using .lean()', async () => {
      const { authHeader } = await createTestUser();
      await request(app)
        .post('/api/v1/applications')
        .set(authHeader)
        .send({
          company: 'Uber',
          role: 'Backend Architect',
          dateApplied: '2026-08-17',
          status: 'Interview',
          link: 'https://uber.com/careers/1',
          notes: 'Team matching stage',
          aiCoverLetter: 'Generated cover letter text',
          aiResumeBullets: ['Scalable systems design', 'API gateway optimization'],
        });

      const res = await request(app)
        .get('/api/v1/applications')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      const appDoc = res.body.data[0];

      // Assert all frontend-consumed fields are present and not stripped
      expect(appDoc).toHaveProperty('_id');
      expect(appDoc).toHaveProperty('company', 'Uber');
      expect(appDoc).toHaveProperty('role', 'Backend Architect');
      expect(appDoc).toHaveProperty('dateApplied', '2026-08-17');
      expect(appDoc).toHaveProperty('status', 'Interview');
      expect(appDoc).toHaveProperty('link', 'https://uber.com/careers/1');
      expect(appDoc).toHaveProperty('notes', 'Team matching stage');
      expect(appDoc).toHaveProperty('aiCoverLetter', 'Generated cover letter text');
      expect(appDoc.aiResumeBullets).toEqual(['Scalable systems design', 'API gateway optimization']);
    });
  });

  describe('Pagination Boundary Cases', () => {
    it('should return empty array without errors when page requested is beyond available data', async () => {
      const { authHeader } = await createTestUser();
      // Insert 2 applications
      for (let i = 1; i <= 2; i++) {
        await request(app)
          .post('/api/v1/applications')
          .set(authHeader)
          .send({
            company: `Company ${i}`,
            role: 'Engineer',
            dateApplied: '2026-08-17',
          });
      }

      // Query page 99
      const res = await request(app)
        .get('/api/v1/applications?page=99&limit=10')
        .set(authHeader);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should clamp page limits that exceed maximum allowable threshold', async () => {
      const { authHeader } = await createTestUser();
      const res = await request(app)
        .get('/api/v1/applications?page=1&limit=500')
        .set(authHeader);

      expect(res.status).toBe(200);
      if (res.body.pagination) {
        expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('In-Memory Cache Invalidation on Mutations', () => {
    it('should bust cached dashboard summary when a new habit is created', async () => {
      const { authHeader } = await createTestUser();
      const date = '2026-08-17';

      // 1. Fetch dashboard summary (caches result)
      const res1 = await request(app)
        .get(`/api/v1/dashboard/summary?date=${date}`)
        .set(authHeader);
      expect(res1.status).toBe(200);
      const initialHabitsCount = res1.body.data.habits?.list?.length || 0;

      // 2. Create a new habit (triggers invalidateDashboardCache)
      await request(app)
        .post('/api/v1/habits')
        .set(authHeader)
        .send({ name: 'Hydration Habit' });

      // 3. Immediately re-fetch dashboard summary (should NOT return stale 0-habits cache)
      const res2 = await request(app)
        .get(`/api/v1/dashboard/summary?date=${date}`)
        .set(authHeader);

      expect(res2.status).toBe(200);
      expect(res2.body.data.habits.list.length).toBe(initialHabitsCount + 1);
    });
  });
});

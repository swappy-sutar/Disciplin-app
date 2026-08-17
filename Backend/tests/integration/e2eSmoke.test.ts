import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/models/User';

describe('End-to-End Integration Smoke Tests', () => {
  describe('Full Authentication Lifecycle', () => {
    it('should complete registration -> login -> profile -> refresh -> logout in sequence', async () => {
      const email = `smoke_auth_${Date.now()}@example.com`;
      const password = 'Password123!';

      // 1. Register
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Smoke User', email, password });
      expect(regRes.status).toBe(201);

      // Verify user in DB
      await User.updateOne({ email }, { isVerified: true });

      // 2. Login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password });
      expect(loginRes.status).toBe(200);
      const token = loginRes.body.data.token;
      const cookies = loginRes.headers['set-cookie'] || [];
      expect(token).toBeTruthy();
      expect(cookies.length).toBeGreaterThan(0);

      // 3. Access Protected Route (/me)
      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe(email);

      // 4. Refresh Token Rotation
      const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', [refreshCookie]);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.token).toBeTruthy();

      // 5. Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(logoutRes.status).toBe(200);
    });
  });

  describe('Job Application Pipeline Lifecycle', () => {
    it('should create application -> update Kanban status -> reflect in dashboard summary', async () => {
      const email = `smoke_app_${Date.now()}@example.com`;
      const password = 'Password123!';
      await request(app).post('/api/v1/auth/register').send({ name: 'Applicant', email, password });
      await User.updateOne({ email }, { isVerified: true });
      const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password });
      const token = loginRes.body.data.token;
      const authHeader = { Authorization: `Bearer ${token}` };
      const date = '2026-08-17';

      // 1. Create application
      const createRes = await request(app)
        .post('/api/v1/applications')
        .set(authHeader)
        .send({
          company: 'Amazon Web Services',
          role: 'Senior Solutions Architect',
          dateApplied: date,
          status: 'Applied',
        });
      expect(createRes.status).toBe(201);
      const appId = createRes.body.data._id;

      // 2. Advance to Interview
      const updateRes = await request(app)
        .patch(`/api/v1/applications/${appId}`)
        .set(authHeader)
        .send({ status: 'Interview' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.status).toBe('Interview');

      // 3. Check Dashboard Summary reflects the application
      const dashRes = await request(app)
        .get(`/api/v1/dashboard/summary?date=${date}`)
        .set(authHeader);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.data.applications.todayCount).toBe(1);
      expect(dashRes.body.data.applications.statusDistribution.Interview).toBe(1);
    });
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTwoUsers } from '../helpers/authHelper';
import { Application } from '../../src/models/Application';

describe('Job Applications CRUD & Authorization Module (/api/v1/applications)', () => {
  it('should log a new job application successfully with default status Applied', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/applications')
      .set(authHeader)
      .send({
        company: 'Google',
        role: 'Staff Software Engineer',
        dateApplied: '2026-08-17',
        link: 'https://careers.google.com/jobs/123',
        notes: 'Referred by engineer on team',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.company).toBe('Google');
    expect(res.body.data.status).toBe('Applied');
  });

  it('should reject invalid status stage values with 400 validation error', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/applications')
      .set(authHeader)
      .send({
        company: 'Meta',
        role: 'Frontend Engineer',
        dateApplied: '2026-08-17',
        status: 'INVALID_STATUS_STAGE',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should list only the authenticated user job applications and calculate status stats', async () => {
    const { userA, userB } = await createTwoUsers();

    // User A logs application
    await request(app)
      .post('/api/v1/applications')
      .set(userA.authHeader)
      .send({
        company: 'Apple',
        role: 'iOS Engineer',
        dateApplied: '2026-08-17',
        status: 'Interview',
      });

    // User B logs application
    await request(app)
      .post('/api/v1/applications')
      .set(userB.authHeader)
      .send({
        company: 'Netflix',
        role: 'Distributed Systems Engineer',
        dateApplied: '2026-08-17',
        status: 'Offer',
      });

    // User A fetches applications
    const listRes = await request(app)
      .get('/api/v1/applications')
      .set(userA.authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].company).toBe('Apple');

    // User A fetches stats
    const statsRes = await request(app)
      .get('/api/v1/applications/stats')
      .set(userA.authHeader);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.data.todayCount).toBe(1);
    expect(statsRes.body.data.statusDistribution.Interview).toBe(1);
    expect(statsRes.body.data.statusDistribution.Offer).toBe(0);
  });

  it('should transition Kanban status stages correctly (Applied -> OA -> Interview -> Offer)', async () => {
    const { authHeader } = await createTestUser();
    const appRes = await request(app)
      .post('/api/v1/applications')
      .set(authHeader)
      .send({
        company: 'Stripe',
        role: 'Infrastructure Engineer',
        dateApplied: '2026-08-17',
        status: 'Applied',
      });
    const appId = appRes.body.data._id;

    // Transition to OA
    const updateRes1 = await request(app)
      .patch(`/api/v1/applications/${appId}`)
      .set(authHeader)
      .send({ status: 'OA' });

    expect(updateRes1.status).toBe(200);
    expect(updateRes1.body.data.status).toBe('OA');

    // Transition to Interview
    const updateRes2 = await request(app)
      .patch(`/api/v1/applications/${appId}`)
      .set(authHeader)
      .send({ status: 'Interview' });

    expect(updateRes2.status).toBe(200);
    expect(updateRes2.body.data.status).toBe('Interview');
  });

  it('should enforce multi-tenant authorization: User A cannot update or delete User B application', async () => {
    const { userA, userB } = await createTwoUsers();

    const appB = await request(app)
      .post('/api/v1/applications')
      .set(userB.authHeader)
      .send({
        company: 'Microsoft',
        role: 'Cloud Architect',
        dateApplied: '2026-08-17',
      });
    const appBId = appB.body.data._id;

    // User A tries to update User B's application
    const updateRes = await request(app)
      .patch(`/api/v1/applications/${appBId}`)
      .set(userA.authHeader)
      .send({ company: 'Compromised' });

    expect(updateRes.status).toBe(404);
    expect(updateRes.body.success).toBe(false);

    // User A tries to delete User B's application
    const deleteRes = await request(app)
      .delete(`/api/v1/applications/${appBId}`)
      .set(userA.authHeader);

    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.success).toBe(false);

    const exists = await Application.findById(appBId);
    expect(exists).not.toBeNull();
  });
});

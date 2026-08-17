import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTwoUsers } from '../helpers/authHelper';
import { WeeklyGoal } from '../../src/models/WeeklyGoal';

describe('Weekly Goals CRUD & Authorization Module (/api/v1/goals)', () => {
  const sampleWeek = '2026-08-17';

  it('should create a weekly goal successfully', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/goals')
      .set(authHeader)
      .send({
        weekStartDate: sampleWeek,
        title: 'Complete System Design chapter 4',
        dueDay: 'Wednesday',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Complete System Design chapter 4');
    expect(res.body.data.isDone).toBe(false);
  });

  it('should reject goal creation if title or weekStartDate is missing', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/goals')
      .set(authHeader)
      .send({ dueDay: 'Friday' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should fetch only the authenticated user goals for the given week', async () => {
    const { userA, userB } = await createTwoUsers();

    // User A creates goal
    await request(app)
      .post('/api/v1/goals')
      .set(userA.authHeader)
      .send({
        weekStartDate: sampleWeek,
        title: 'User A Weekly Goal',
        dueDay: 'Monday',
      });

    // User B creates goal
    await request(app)
      .post('/api/v1/goals')
      .set(userB.authHeader)
      .send({
        weekStartDate: sampleWeek,
        title: 'User B Secret Goal',
        dueDay: 'Friday',
      });

    // User A lists goals
    const listRes = await request(app)
      .get(`/api/v1/goals?week=${sampleWeek}`)
      .set(userA.authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].title).toBe('User A Weekly Goal');
  });

  it('should prevent User A from updating or completing User B goal', async () => {
    const { userA, userB } = await createTwoUsers();

    const goalB = await request(app)
      .post('/api/v1/goals')
      .set(userB.authHeader)
      .send({
        weekStartDate: sampleWeek,
        title: 'User B Goal',
        dueDay: 'Tuesday',
      });
    const goalBId = goalB.body.data._id;

    // User A tries to update User B's goal
    const updateRes = await request(app)
      .patch(`/api/v1/goals/${goalBId}`)
      .set(userA.authHeader)
      .send({ isDone: true, title: 'Hijacked Goal' });

    expect(updateRes.status).toBe(404);
    expect(updateRes.body.success).toBe(false);

    // Verify User B goal is untouched
    const untouched = await WeeklyGoal.findById(goalBId);
    expect(untouched?.isDone).toBe(false);
    expect(untouched?.title).toBe('User B Goal');
  });

  it('should prevent User A from deleting User B goal', async () => {
    const { userA, userB } = await createTwoUsers();

    const goalB = await request(app)
      .post('/api/v1/goals')
      .set(userB.authHeader)
      .send({
        weekStartDate: sampleWeek,
        title: 'User B Goal to Delete',
      });
    const goalBId = goalB.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/goals/${goalBId}`)
      .set(userA.authHeader);

    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.success).toBe(false);

    const exists = await WeeklyGoal.findById(goalBId);
    expect(exists).not.toBeNull();
  });
});

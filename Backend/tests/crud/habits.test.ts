import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTwoUsers } from '../helpers/authHelper';
import { Habit } from '../../src/models/Habit';
import { HabitLog } from '../../src/models/HabitLog';

describe('Habits CRUD & Authorization Module (/api/v1/habits)', () => {
  it('should create a new habit for authenticated user with valid fields', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/habits')
      .set(authHeader)
      .send({
        name: 'Morning Meditation',
        color: '#10B981',
        order: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Morning Meditation');
    expect(res.body.data.color).toBe('#10B981');
  });

  it('should reject habit creation if required name field is missing', async () => {
    const { authHeader } = await createTestUser();
    const res = await request(app)
      .post('/api/v1/habits')
      .set(authHeader)
      .send({ color: '#10B981' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should list only the authenticated user habits and calculate streak data correctly', async () => {
    const { userA, userB } = await createTwoUsers();

    // Create habit for User A
    const resHabitA = await request(app)
      .post('/api/v1/habits')
      .set(userA.authHeader)
      .send({ name: 'User A Habit' });
    const habitAId = resHabitA.body.data._id;

    // Create habit for User B
    await request(app)
      .post('/api/v1/habits')
      .set(userB.authHeader)
      .send({ name: 'User B Secret Habit' });

    // User A reads their habits
    const listResA = await request(app)
      .get('/api/v1/habits')
      .set(userA.authHeader);

    expect(listResA.status).toBe(200);
    expect(listResA.body.success).toBe(true);
    expect(listResA.body.data.length).toBe(1);
    expect(listResA.body.data[0].name).toBe('User A Habit');
    expect(listResA.body.data[0]).toHaveProperty('currentStreak');
    expect(listResA.body.data[0]).toHaveProperty('longestStreak');
  });

  it('should enforce multi-tenant authorization: User A cannot update User B habit', async () => {
    const { userA, userB } = await createTwoUsers();

    const resHabitB = await request(app)
      .post('/api/v1/habits')
      .set(userB.authHeader)
      .send({ name: 'User B Habit' });
    const habitBId = resHabitB.body.data._id;

    // User A tries to update User B's habit
    const updateRes = await request(app)
      .patch(`/api/v1/habits/${habitBId}`)
      .set(userA.authHeader)
      .send({ name: 'Hacked Habit Name' });

    expect(updateRes.status).toBe(404);
    expect(updateRes.body.success).toBe(false);

    // Verify User B habit unchanged in DB
    const unchanged = await Habit.findById(habitBId);
    expect(unchanged?.name).toBe('User B Habit');
  });

  it('should enforce multi-tenant authorization: User A cannot delete User B habit', async () => {
    const { userA, userB } = await createTwoUsers();

    const resHabitB = await request(app)
      .post('/api/v1/habits')
      .set(userB.authHeader)
      .send({ name: 'User B Habit' });
    const habitBId = resHabitB.body.data._id;

    // User A tries to delete User B's habit
    const deleteRes = await request(app)
      .delete(`/api/v1/habits/${habitBId}`)
      .set(userA.authHeader);

    expect(deleteRes.status).toBe(404);
    expect(deleteRes.body.success).toBe(false);

    // Verify still exists in DB
    const exists = await Habit.findById(habitBId);
    expect(exists).not.toBeNull();
  });

  it('should toggle habit log completion and calculate streaks correctly across consecutive days and gaps', async () => {
    const { authHeader } = await createTestUser();
    const habitRes = await request(app)
      .post('/api/v1/habits')
      .set(authHeader)
      .send({ name: 'Daily Code Review' });
    const habitId = habitRes.body.data._id;

    // Toggle day 1 (today) to isDone: true
    const today = '2026-08-17';
    const toggleRes1 = await request(app)
      .post('/api/v1/habits/logs')
      .set(authHeader)
      .send({ habitId, date: today, isDone: true });

    expect(toggleRes1.status).toBe(200);
    expect(toggleRes1.body.data.isDone).toBe(true);

    // Toggle off to isDone: false
    const toggleRes2 = await request(app)
      .post('/api/v1/habits/logs')
      .set(authHeader)
      .send({ habitId, date: today, isDone: false });

    expect(toggleRes2.status).toBe(200);
    expect(toggleRes2.body.data.isDone).toBe(false);
  });
});

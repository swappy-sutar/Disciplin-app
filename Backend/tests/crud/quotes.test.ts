import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser, createTwoUsers } from '../helpers/authHelper';
import { Quote } from '../../src/models/Quote';

describe('Quotes Module (/api/v1/quotes/*)', () => {
  it('should return a default motivational quote if no quotes exist in database', async () => {
    const { authHeader } = await createTestUser();

    const res = await request(app)
      .get('/api/v1/quotes/today?date=2026-08-17')
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('Make today your masterpiece.');
    expect(res.body.data.author).toBe('John Wooden');
  });

  it('should create a custom quote for the user', async () => {
    const { authHeader } = await createTestUser();

    const res = await request(app)
      .post('/api/v1/quotes')
      .set(authHeader)
      .send({
        text: 'The secret of getting ahead is getting started.',
        author: 'Mark Twain',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBe('The secret of getting ahead is getting started.');
    expect(res.body.data.isCustom).toBe(true);
  });

  it('should toggle favorite status of a quote', async () => {
    const { authHeader, user } = await createTestUser();

    const quote = await Quote.create({
      text: 'Stay hungry, stay foolish.',
      author: 'Steve Jobs',
      isCustom: true,
      userId: user._id,
      isFavorite: false,
    });

    const res = await request(app)
      .patch(`/api/v1/quotes/${quote._id}/favorite`)
      .set(authHeader);

    expect(res.status).toBe(200);
    expect(res.body.data.isFavorite).toBe(true);
  });

  it('should prevent User A from toggling favorite on User B custom quote', async () => {
    const { userA, userB } = await createTwoUsers();

    const quoteB = await Quote.create({
      text: 'Private quote of User B',
      author: 'User B',
      isCustom: true,
      userId: userB.user._id,
    });

    const res = await request(app)
      .patch(`/api/v1/quotes/${quoteB._id}/favorite`)
      .set(userA.authHeader);

    expect(res.status).toBe(404);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { Review } from '../../src/models/Review';

describe('Reviews Module (/api/v1/reviews)', () => {
  it('should list approved reviews for public landing page', async () => {
    await Review.create([
      { name: 'Alice Dev', role: 'Frontend Engineer', comment: 'Great tool!', rating: 5, isApproved: true },
      { name: 'Pending Person', role: 'Intern', comment: 'Waiting for approval', rating: 4, isApproved: false },
    ]);

    const res = await request(app).get('/api/v1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((r: any) => r.isApproved === true)).toBe(true);
  });

  it('should submit a new review with valid rating and content', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({
        name: 'Happy User',
        role: 'Full Stack Dev',
        rating: 5,
        comment: 'Disciplin completely boosted my daily productivity.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Happy User');
  });

  it('should reject review submission with invalid rating (< 1 or > 5)', async () => {
    const res = await request(app)
      .post('/api/v1/reviews')
      .send({
        name: 'Invalid Rating User',
        role: 'Tester',
        rating: 10,
        comment: 'Too high rating',
      });

    expect(res.status).toBe(400);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/authHelper';
import { User } from '../../src/models/User';
import { Review } from '../../src/models/Review';

describe('Admin Panel Module (/api/v1/admin/*)', () => {
  it('should deny non-admin users with 403 Forbidden', async () => {
    const regularUser = await createTestUser({ role: 'user' });

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set(regularUser.authHeader);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin user to fetch system-wide overview statistics', async () => {
    const admin = await createTestUser({ role: 'admin' });

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set(admin.authHeader);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalHabits');
    expect(res.body.data).toHaveProperty('totalApplications');
    expect(res.body.data).toHaveProperty('totalGoals');
    expect(res.body.data).toHaveProperty('totalReviews');
  });

  it('should allow admin to list, search, and paginate registered users', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const userTarget = await createTestUser({ name: 'Searchable Target Person', role: 'user' });

    // List without search
    const listRes = await request(app)
      .get('/api/v1/admin/users?page=1&limit=10')
      .set(admin.authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // Search by name
    const searchRes = await request(app)
      .get('/api/v1/admin/users?search=Searchable')
      .set(admin.authHeader);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.some((u: any) => u.name === userTarget.user.name)).toBe(true);
  });

  it('should allow admin to update a user role and reject invalid roles', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const regularUser = await createTestUser({ role: 'user' });

    // Update to premium
    const updateRes = await request(app)
      .patch(`/api/v1/admin/users/${regularUser.user._id}/role`)
      .set(admin.authHeader)
      .send({ role: 'premium' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.role).toBe('premium');

    // Reject invalid role
    const invalidRes = await request(app)
      .patch(`/api/v1/admin/users/${regularUser.user._id}/role`)
      .set(admin.authHeader)
      .send({ role: 'super_hacker' });

    expect(invalidRes.status).toBe(400);
  });

  it('should allow admin to delete a user and cascade clean their data', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const victim = await createTestUser({ role: 'user' });

    const deleteRes = await request(app)
      .delete(`/api/v1/admin/users/${victim.user._id}`)
      .set(admin.authHeader);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const check = await User.findById(victim.user._id);
    expect(check).toBeNull();
  });

  it('should allow admin to manage and approve/delete user reviews', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const reviewer = await createTestUser({ role: 'user' });

    const review = await Review.create({
      name: reviewer.user.name,
      role: 'Software Engineer',
      userId: reviewer.user._id,
      rating: 5,
      comment: 'Super awesome productivity platform!',
      isApproved: false,
    });

    // List reviews
    const listRes = await request(app)
      .get('/api/v1/admin/reviews?page=1&limit=10')
      .set(admin.authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    // Toggle approval
    const approveRes = await request(app)
      .patch(`/api/v1/admin/reviews/${review._id}/approve`)
      .set(admin.authHeader)
      .send({ isApproved: true });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.isApproved).toBe(true);

    // Delete review
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/reviews/${review._id}`)
      .set(admin.authHeader);

    expect(deleteRes.status).toBe(200);
    const exists = await Review.findById(review._id);
    expect(exists).toBeNull();
  });
});

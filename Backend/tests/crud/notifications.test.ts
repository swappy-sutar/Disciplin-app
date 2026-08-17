import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';
import { createTestUser } from '../helpers/authHelper';
import { Notification } from '../../src/models/Notification';

describe('Notifications Module (/api/v1/notifications)', () => {
  it('should create and retrieve notifications for authenticated user', async () => {
    const { authHeader, user } = await createTestUser();

    // Create notification
    const createRes = await request(app)
      .post('/api/v1/notifications')
      .set(authHeader)
      .send({
        title: 'Habit Reminder',
        message: "Don't forget your workout today!",
        type: 'habit',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    // List notifications
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set(authHeader);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].title).toBe('Habit Reminder');
  });

  it('should mark all notifications as read and clear all notifications', async () => {
    const { authHeader, user } = await createTestUser();

    await Notification.create([
      { userId: user._id, title: 'Alert 1', message: 'Test message 1', read: false },
      { userId: user._id, title: 'Alert 2', message: 'Test message 2', read: false },
    ]);

    // Mark all as read
    const markRes = await request(app)
      .patch('/api/v1/notifications/mark-read')
      .set(authHeader);

    expect(markRes.status).toBe(200);

    // Clear all
    const clearRes = await request(app)
      .delete('/api/v1/notifications')
      .set(authHeader);

    expect(clearRes.status).toBe(200);

    const check = await Notification.countDocuments({ userId: user._id });
    expect(check).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

describe('Contact & Support Form Module (/api/v1/contact)', () => {
  it('should successfully submit contact form and send confirmation', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'Curious User',
        email: 'curious@example.com',
        subject: 'Feature Request: Habit Reminders',
        message: 'Could you add WhatsApp notifications for daily habit tracking?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('message has been sent successfully');
  });

  it('should reject contact form with invalid email or missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'Incomplete User',
        email: 'not-an-email',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Registration successful');
  });

  it('should not register user with duplicate email', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);

    const res = await request(app).post('/api/v1/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing verified user', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    
    // Bypassing verification mail for testing
    await User.updateOne({ email: testUser.email }, { isVerified: true });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should fetch the profile of the logged-in user', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    await User.updateOne({ email: testUser.email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });
});

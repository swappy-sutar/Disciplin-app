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
    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should reject request to protected route if token is invalid or missing', async () => {
    // 1. Missing token
    const resNoToken = await request(app)
      .get('/api/v1/auth/me');
    expect(resNoToken.status).toBe(401);
    expect(resNoToken.body.success).toBe(false);

    // 2. Invalid token
    const resInvalidToken = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token-12345');
    expect(resInvalidToken.status).toBe(401);
    expect(resInvalidToken.body.success).toBe(false);
  });

  it('should successfully refresh access token using a valid refresh token and rotate it', async () => {
    await request(app).post('/api/v1/auth/register').send(testUser);
    await User.updateOne({ email: testUser.email }, { isVerified: true });

    // Login to get cookies
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const setCookies = loginRes.headers['set-cookie'] || [];
    expect(setCookies).toBeDefined();

    // Helper to format cookies for request
    const getCookieHeader = (cookiesList: string[]) => cookiesList.map(c => c.split(';')[0]).join('; ');
    const initialCookieHeader = getCookieHeader(setCookies);

    // Perform refresh by sending the cookies back
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', initialCookieHeader);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(refreshRes.body.data.token).toBeDefined();

    const newAccessToken = refreshRes.body.data.token;
    const newSetCookies = refreshRes.headers['set-cookie'] || [];
    expect(newSetCookies).toBeDefined();

    // Verify the new access token allows access to protected routes
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${newAccessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(testUser.email);

    // Re-trying to refresh with the old refresh token cookie must fail (due to refresh token rotation/revocation)
    const secondRefreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', initialCookieHeader);

    expect(secondRefreshRes.status).toBe(401);
    expect(secondRefreshRes.body.success).toBe(false);
  });

  it('should reject refresh requests if the refresh token is missing, invalid, or expired', async () => {
    // 1. Missing refresh token
    const resNoToken = await request(app)
      .post('/api/v1/auth/refresh');
    expect(resNoToken.status).toBe(401);

    // 2. Invalid refresh token in body
    const resInvalidBodyToken = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-refresh-token' });
    expect(resInvalidBodyToken.status).toBe(401);

    // 3. Invalid refresh token in cookie
    const resInvalidCookieToken = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=invalid-cookie-token; Path=/; HttpOnly']);
    expect(resInvalidCookieToken.status).toBe(401);
  });

  it('should validate google login request fields correctly', async () => {
    // 1. Missing idToken entirely or sending the old 'token' field should trigger Zod Validation Error
    const resOldToken = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ token: 'dummy-google-token-long-enough-12345' });
    
    expect(resOldToken.status).toBe(400);
    expect(resOldToken.body.message).toBe('Validation Error');
    expect(resOldToken.body.errors[0].field).toBe('body.idToken');

    // 2. Sending correct idToken should pass Zod validation (even if Google SDK rejects the dummy token later)
    const resCorrectToken = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'dummy-google-token-long-enough-12345' });
    
    // It passes Zod validation, and then fails at the controller level (Google SDK verifyIdToken)
    expect(resCorrectToken.status).toBe(400);
    expect(resCorrectToken.body.message).toContain('Invalid or expired Google ID token');
  });

  it('should validate reset password request fields correctly', async () => {
    // 1. Missing reset token in body should fail Zod validation
    const resNoToken = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ password: 'new-secure-password' });
    
    expect(resNoToken.status).toBe(400);
    expect(resNoToken.body.message).toBe('Validation Error');
    expect(resNoToken.body.errors[0].field).toBe('body.token');

    // 2. Correct token and password should pass Zod validation
    const resCorrect = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'dummy-reset-token', password: 'new-secure-password' });
    
    // It passes Zod validation, and fails at the controller level due to invalid token in DB
    expect(resCorrect.status).toBe(400);
    expect(resCorrect.body.message).toContain('Invalid or expired reset token');
  });
});


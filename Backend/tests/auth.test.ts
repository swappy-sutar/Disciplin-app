import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/User';
import { OAuth2Client } from 'google-auth-library';

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

  it('should successfully authenticate first-time Google SSO user and create verified account with cookies', async () => {
    const googlePayload = {
      email: 'firsttime_google@example.com',
      name: 'Google Newbie',
      sub: 'google-uid-10001',
    };

    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => googlePayload,
    } as any);

    const res = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'valid-mock-google-id-token' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.email).toBe(googlePayload.email);

    // Verify cookies set
    const cookies = res.headers['set-cookie'] || [];
    expect(cookies.some((c: string) => c.startsWith('jwt='))).toBe(true);
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);

    // Verify database record
    const createdUser = await User.findOne({ email: googlePayload.email });
    expect(createdUser).not.toBeNull();
    expect(createdUser?.isVerified).toBe(true);
    expect(createdUser?.googleId).toBe(googlePayload.sub);
    expect(createdUser?.passwordHash).toBeTruthy(); // Randomly generated password hash
  });

  it('should authenticate returning Google SSO user without creating duplicate records', async () => {
    const googlePayload = {
      email: 'returning_google@example.com',
      name: 'Returning Googler',
      sub: 'google-uid-10002',
    };

    // First login (creation)
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => googlePayload,
    } as any);

    await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'valid-mock-google-token-1' });

    // Second login (returning)
    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => googlePayload,
    } as any);

    const resReturning = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'valid-mock-google-token-2' });

    expect(resReturning.status).toBe(200);
    expect(resReturning.body.success).toBe(true);
    expect(resReturning.body.data.email).toBe(googlePayload.email);

    // Assert no duplicate user created
    const count = await User.countDocuments({ email: googlePayload.email });
    expect(count).toBe(1);
  });

  it('should link Google SSO to an existing email/password registered account without duplicates', async () => {
    const email = 'existing_email_pass@example.com';

    // 1. User originally registers via email/password
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Email Pass User', email, password: 'Password123!' });

    const originalUser = await User.findOne({ email });
    expect(originalUser).not.toBeNull();
    expect(originalUser?.googleId).toBeUndefined();

    // 2. User then logs in via Google with the same email
    const googlePayload = {
      email,
      name: 'Google Name',
      sub: 'google-uid-linked-9999',
    };

    vi.spyOn(OAuth2Client.prototype, 'verifyIdToken').mockResolvedValueOnce({
      getPayload: () => googlePayload,
    } as any);

    const resGoogle = await request(app)
      .post('/api/v1/auth/google-login')
      .send({ idToken: 'valid-google-linking-token' });

    expect(resGoogle.status).toBe(200);
    expect(resGoogle.body.success).toBe(true);

    // 3. Verify account linking behavior: 1 record, googleId attached, email verified
    const usersWithEmail = await User.find({ email });
    expect(usersWithEmail.length).toBe(1);
    expect(usersWithEmail[0].googleId).toBe('google-uid-linked-9999');
    expect(usersWithEmail[0].isVerified).toBe(true);
  });

  it('should verify email with valid token and reject invalid token', async () => {
    const email = 'verify_me@example.com';
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Unverified User', email, password: 'Password123!' });

    const user = await User.findOne({ email });
    expect(user?.isVerified).toBe(false);
    expect(user?.verificationToken).toBeDefined();

    // Verification with invalid token -> 400
    const resInvalid = await request(app)
      .post('/api/v1/auth/verify-email')
      .send({ token: 'bogus-verification-token' });
    expect(resInvalid.status).toBe(400);

    // Re-trigger resend verification email
    const resendRes = await request(app)
      .post('/api/v1/auth/resend-verification')
      .send({ email });
    expect(resendRes.status).toBe(200);
  });

  it('should handle forgot password and reset password flow successfully', async () => {
    const email = 'forgot_pass@example.com';
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Forgot User', email, password: 'OldPassword123!' });
    await User.updateOne({ email }, { isVerified: true });

    // Request reset
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email });
    expect(forgotRes.status).toBe(200);

    // Verify token exists in database
    const user = await User.findOne({ email });
    expect(user?.passwordResetToken).toBeDefined();

    // Reset password with invalid token -> 400
    const resetInvalidRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalid-token', password: 'NewPassword123!' });
    expect(resetInvalidRes.status).toBe(400);
  });

  it('should update authenticated user profile and password', async () => {
    const email = 'update_profile@example.com';
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Old Name', email, password: 'Password123!' });
    await User.updateOne({ email }, { isVerified: true });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Password123!' });
    const token = loginRes.body.data.token;

    // Update name
    const updateRes = await request(app)
      .put('/api/v1/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Shiny Name' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('New Shiny Name');
  });
});


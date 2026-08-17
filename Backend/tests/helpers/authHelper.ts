import { User, IUser } from '../../src/models/User';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../../src/utils/auth-helpers';

export interface TestUserContext {
  user: any;
  token: string;
  refreshToken: string;
  cookies: string[];
  rawPassword: string;
  authHeader: { Authorization: string };
}

/**
 * Creates and verifies a test user directly in MongoDB and generates valid JWT tokens.
 * Fast, isolated, and immune to rate limiting.
 */
export async function createTestUser(override?: Partial<IUser> & { password?: string }): Promise<TestUserContext> {
  const timestamp = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  const email = override?.email || `testuser_${timestamp}@example.com`;
  const rawPassword = override?.password || 'Password123!';
  const name = override?.name || `Test User ${timestamp}`;
  const hashedPassword = await bcrypt.hash(rawPassword, 4); // Low salt rounds for fast test execution

  const user = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    isVerified: true,
    role: override?.role || 'user',
  });

  const token = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: user.toObject(),
    token,
    refreshToken,
    cookies: [`refreshToken=${refreshToken}; Path=/; HttpOnly`],
    rawPassword,
    authHeader: { Authorization: `Bearer ${token}` },
  };
}

/**
 * Creates two independent users to test multi-tenant data isolation and authorization checks.
 */
export async function createTwoUsers(): Promise<{ userA: TestUserContext; userB: TestUserContext }> {
  const userA = await createTestUser({ name: 'User Alice' });
  const userB = await createTestUser({ name: 'User Bob' });
  return { userA, userB };
}

import { User, IUser } from '../models/User';
import { ConflictError, UnauthorizedError } from '../utils/custom-errors';
import { seedUserHabits, seedUserProfileData } from '../utils/seed-data';
import crypto from 'crypto';

export const registerUser = async (name: string, email: string, passwordHash: string): Promise<{ user: IUser; verificationToken: string }> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const rawToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = new User({
    name,
    email,
    passwordHash, // This will be hashed on save by pre('save')
    verificationToken: hashedToken,
    verificationExpires: expires,
    isVerified: false,
  });

  await user.save();

  await seedUserHabits(user._id);
  await seedUserProfileData(user._id);

  return { user, verificationToken: rawToken };
};

export const loginUser = async (email: string, password: string): Promise<IUser> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return user;
};

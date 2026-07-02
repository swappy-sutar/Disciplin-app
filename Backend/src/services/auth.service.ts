import { User, IUser } from '../models/User';
import { ConflictError, UnauthorizedError } from '../utils/custom-errors';
import { seedUserHabits } from '../utils/seed-data';

export const registerUser = async (name: string, email: string, passwordHash: string): Promise<IUser> => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  const user = new User({
    name,
    email,
    passwordHash, // This will be hashed on save by pre('save')
  });

  await user.save();

  await seedUserHabits(user._id);

  return user;
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

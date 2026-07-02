import { Types } from 'mongoose';
import { Quote } from '../models/Quote';
import { Habit } from '../models/Habit';

const DEFAULT_QUOTES: any[] = [];
const DEFAULT_HABITS: any[] = [];

/**
 * Seed global quotes on system startup if empty
 */
export const seedGlobalQuotes = async (): Promise<void> => {
  // Empty seed logic
};

/**
 * Seed default habits for a specific user upon registration
 */
export const seedUserHabits = async (userId: Types.ObjectId | string): Promise<void> => {
  // Empty seed logic
};

import { TimetableBlock } from '../models/TimetableBlock';
import { WeeklyGoal } from '../models/WeeklyGoal';
import { Topic } from '../models/Topic';

export const seedUserProfileData = async (userId: Types.ObjectId | string): Promise<void> => {
  // Empty seed logic
};

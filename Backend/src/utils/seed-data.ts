import { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Quote } from '../models/Quote';
import { Habit } from '../models/Habit';
import { Exercise } from '../models/Exercise';

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

export const seedUserProfileData = async (userId: Types.ObjectId | string): Promise<void> => {
  // Empty seed logic
};

/**
 * Seed global exercise library
 */
export const seedExercises = async (): Promise<void> => {
  try {
    const count = await Exercise.countDocuments();
    if (count > 0) {
      console.log('✅ Exercise library already seeded.');
      return;
    }

    const filePath = path.join(__dirname, '../scripts/exercises.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      await Exercise.insertMany(data);
      console.log(`✅ Seeded ${data.length} default exercises from JSON successfully!`);
    } else {
      console.log('⚠️ exercises.json file not found, skipping startup seed.');
    }
  } catch (error) {
    console.error('❌ Error seeding exercises:', error);
  }
};

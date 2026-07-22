import { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Quote } from '../models/Quote';
import { Habit } from '../models/Habit';
import { Exercise } from '../models/Exercise';

const DEFAULT_QUOTES: any[] = [
  { text: "Make today your masterpiece.", author: "John Wooden" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" }
];
const DEFAULT_HABITS: any[] = [];

/**
 * Seed global quotes on system startup if empty
 */
export const seedGlobalQuotes = async (): Promise<void> => {
  try {
    const count = await Quote.countDocuments({ isCustom: false });
    if (count > 0) {
      console.log('✅ Global quotes already seeded.');
      return;
    }
    await Quote.insertMany(DEFAULT_QUOTES.map(q => ({ ...q, isCustom: false, isFavorite: false })));
    console.log(`✅ Seeded ${DEFAULT_QUOTES.length} global motivational quotes successfully!`);
  } catch (error) {
    console.error('❌ Error seeding global quotes:', error);
  }
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
